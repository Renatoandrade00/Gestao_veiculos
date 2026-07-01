import nodemailer from 'nodemailer';
import { db } from '../lib/db';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

// Inicializar Nodemailer com SMTP real ou modo de log (dev)
// nodemailer v9 removeu createTestAccount() e getTestMessageUrl().
// Em dev sem SMTP configurado, o e-mail é apenas logado no console.
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Modo dev: usa SMTP do Ethereal via variáveis de ambiente opcionais,
  // ou cria um transporter "stub" que apenas registra o conteúdo.
  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  }

  // Fallback: jsonTransport — registra o e-mail como JSON no console
  return nodemailer.createTransport({ jsonTransport: true });
}

function initTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = getTransporter();
  }
  return transporterPromise;
}

export interface MaintenanceAlert {
  vehicleModel: string;
  maintenanceType: string;
  reason: 'mileage' | 'date' | 'both';
  currentMileage: number;
  targetMileage?: number;
  currentDate: Date;
  targetDate?: Date;
}

export async function sendAlertEmail(
  userEmail: string,
  userName: string,
  alerts: MaintenanceAlert[]
): Promise<string | boolean> {
  try {
    const transporter = await initTransporter();

    const alertItemsHtml = alerts.map(alert => {
      const reasonText =
        alert.reason === 'mileage'
          ? `A quilometragem recomendada (${alert.targetMileage} km) está próxima ou foi atingida (Atual: ${alert.currentMileage} km).`
          : alert.reason === 'date'
          ? `A data recomendada (${alert.targetDate?.toLocaleDateString('pt-BR')}) está próxima ou vencida.`
          : `A data (${alert.targetDate?.toLocaleDateString('pt-BR')}) ou quilometragem (${alert.targetMileage} km) recomendada está próxima ou foi atingida.`;

      return `
        <div style="border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; background-color: #fef3c7; border-radius: 4px;">
          <h3 style="margin: 0 0 6px 0; color: #b45309;">${alert.vehicleModel} - ${alert.maintenanceType}</h3>
          <p style="margin: 0; color: #78350f; font-size: 14px;"><strong>Motivo:</strong> ${reasonText}</p>
        </div>
      `;
    }).join('');

    const mailOptions = {
      from: '"Controle de Manutenções" <noreply@manutencao.com>',
      to: userEmail,
      subject: '⚠️ Alerta de Manutenção Veicular Próxima do Vencimento!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Olá, ${userName}!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Identificamos que alguns itens de manutenção dos seus veículos precisam de atenção em breve:</p>
          <div style="margin: 20px 0;">${alertItemsHtml}</div>
          <p style="font-size: 16px; line-height: 1.5;">Recomendamos agendar a revisão para garantir a segurança e o bom funcionamento do seu veículo.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Este é um e-mail automático do seu aplicativo de Controle de Manutenções Veiculares.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // jsonTransport (modo dev sem SMTP): loga o conteúdo do e-mail no console
    if ((info as any).envelope) {
      const jsonInfo = info as any;
      process.stdout.write(
        `\n${'='.repeat(52)}\n` +
        `📧 [MOCK EMAIL - SEM SMTP CONFIGURADO]\n` +
        `Para: ${jsonInfo.envelope?.to ?? userEmail}\n` +
        `Assunto: ${mailOptions.subject}\n` +
        `Para configurar Ethereal, adicione ETHEREAL_USER e ETHEREAL_PASS no .env\n` +
        `${'='.repeat(52)}\n`
      );
      return false; // Sem URL real
    }

    process.stdout.write(`📧 E-mail de alerta enviado. ID: ${info.messageId}\n`);
    return true;
  } catch (error) {
    process.stderr.write(`[alertService] Erro ao enviar e-mail: ${error}\n`);
    return false;
  }
}


// Analisar manutenções de um usuário e disparar alertas se necessário.
// Verifica tanto registros PENDING quanto o registro COMPLETED mais recente
// de cada tipo que tenha nextMaintenanceMileage ou nextMaintenanceDate definidos.
export async function checkUserAlerts(userId: string): Promise<{ alertsSentCount: number; emailUrl?: string | boolean }> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        vehicles: {
          include: {
            maintenances: {
              // Busca TODAS as manutenções, não apenas PENDING
              orderBy: { dateOfMaintenance: 'desc' }
            }
          }
        }
      }
    });

    if (!user || user.vehicles.length === 0) {
      return { alertsSentCount: 0 };
    }

    const alertsToTrigger: MaintenanceAlert[] = [];
    const now = new Date();

    for (const vehicle of user.vehicles) {
      // Agrupa pelo tipo e pega apenas o registro mais recente por tipo.
      // Isso evita alertas duplicados de trocas históricas antigas.
      const latestByType = new Map<string, typeof vehicle.maintenances[0]>();

      for (const maintenance of vehicle.maintenances) {
        const existing = latestByType.get(maintenance.type);
        if (
          !existing ||
          new Date(maintenance.dateOfMaintenance) > new Date(existing.dateOfMaintenance)
        ) {
          latestByType.set(maintenance.type, maintenance);
        }
      }

      // Avalia apenas o registro mais recente de cada tipo
      for (const maintenance of latestByType.values()) {
        // Pula registros que não têm nenhuma referência de próxima manutenção
        if (!maintenance.nextMaintenanceMileage && !maintenance.nextMaintenanceDate) {
          continue;
        }

        let trigger = false;
        let reason: 'mileage' | 'date' | 'both' = 'mileage';

        // 1. Verificar por quilometragem (falta menos de 1000km ou já ultrapassou)
        if (maintenance.nextMaintenanceMileage) {
          const kmRemaining = maintenance.nextMaintenanceMileage - vehicle.mileage;
          if (kmRemaining <= 1000) {
            trigger = true;
            reason = 'mileage';
          }
        }

        // 2. Verificar por data (falta menos de 30 dias ou já passou)
        if (maintenance.nextMaintenanceDate) {
          const timeRemaining = maintenance.nextMaintenanceDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
          if (daysRemaining <= 30) {
            if (trigger) {
              reason = 'both';
            } else {
              trigger = true;
              reason = 'date';
            }
          }
        }

        if (trigger) {
          alertsToTrigger.push({
            vehicleModel: `${vehicle.brand} ${vehicle.model}`,
            maintenanceType: maintenance.type,
            reason,
            currentMileage: vehicle.mileage,
            targetMileage: maintenance.nextMaintenanceMileage || undefined,
            currentDate: now,
            targetDate: maintenance.nextMaintenanceDate || undefined
          });
        }
      }
    }

    if (alertsToTrigger.length > 0) {
      const emailUrl = await sendAlertEmail(user.email, user.name, alertsToTrigger);
      return { alertsSentCount: alertsToTrigger.length, emailUrl };
    }

    return { alertsSentCount: 0 };
  } catch (error) {
    console.error('Erro ao verificar alertas do usuário:', error);
    return { alertsSentCount: 0 };
  }
}

