# Design System: Controle de Manutenções Veiculares

Este documento serve como referência de estilo e tokens visuais para a interface do usuário. A identidade visual foi desenhada com foco em uma aparência premium, mobile-first, moderna e limpa, utilizando uma paleta refinada para evitar esquemas de cores genéricos.

---

## 🎨 Paleta de Cores (Theme Tokens)

Utilizamos o **Tailwind CSS v4** com foco em tons escuros e acentos elegantes de esmeralda.

| Nome | Variável / Valor | Uso |
| :--- | :--- | :--- |
| **Dark BG** | `slate-950` (`#020617`) | Fundo principal da aplicação |
| **Surface** | `slate-900` (`#0f172a`) | Cards, modais e containers secundários |
| **Border** | `slate-800` (`#1e293b`) | Linhas de divisão e bordas de inputs/cards |
| **Text Primary** | `slate-50` (`#f8fafc`) | Títulos e textos de alta ênfase |
| **Text Secondary** | `slate-400` (`#94a3b8`) | Subtítulos e informações de apoio |
| **Accent (Green)** | `emerald-500` (`#10b981`) | Status "Ok", botões primários e destaques de sucesso |
| **Warning (Amber)**| `amber-500` (`#f59e0b`) | Status "Atenção" (manutenção próxima) |
| **Alert (Rose)** | `rose-500` (`#f43f5e`) | Status "Crítico" (manutenção vencida), ações de exclusão |

---

## ✍️ Tipografia

- **Fonte Principal (Interface e Títulos)**: `Outfit`, Sans-Serif (Moderna, geométrica e limpa)
- **Fonte Secundária (Textos longos/Dados)**: `Inter`, Sans-Serif (Excelente legibilidade em dispositivos móveis)

---

## ✨ Componentes & Efeitos Visuais

### Glassmorphism (Cards & Headers)
Para painéis flutuantes e navegação móvel, utilizamos fundos translúcidos com desfoque de fundo:
```css
.glass-panel {
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(30, 41, 59, 0.5);
}
```

### Micro-animações (Interações)
- **Hover/Active em Botões**: Transição suave de escala (`active:scale-95 transition-all duration-200`)
- **Foco em Inputs**: Animação de borda com brilho sutil de esmeralda (`focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`)
- **Alertas**: Animação de pulsar discreto (`animate-pulse`) para itens vencidos de alta prioridade.
