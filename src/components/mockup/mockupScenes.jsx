import VanGraphic from '../media/VanGraphic';
import { VAN_PANEL } from '../media/vanGeometry';

/**
 * Escenas de mockup estándar (viewBox 800×500).
 * Cada escena define:
 *  - `surfaces`: zonas que toman el color de fondo elegido (la superficie impresa).
 *  - `slots`: zonas donde se coloca el logotipo del cliente.
 *  - `render(layers)`: dibuja la escena; `layers[i]` es la superficie i con su logo ya colocado.
 */
export const MOCKUP_SCENES = [
  {
    id: 'valla',
    name: 'Valla',
    surfaces: [{ x: 124, y: 64, width: 552, height: 232 }],
    slots: [{ x: 144, y: 84, width: 512, height: 192 }],
    render: (layers) => (
      <g>
        <rect x={0} y={440} width={800} height={60} fill="#dcdcd7" />
        <ellipse cx={400} cy={446} rx={260} ry={8} fill="#000" opacity={0.07} />
        <rect x={250} y={300} width={18} height={146} fill="#8f8f89" />
        <rect x={532} y={300} width={18} height={146} fill="#8f8f89" />
        <rect x={150} y={316} width={500} height={6} rx={3} fill="#6f6f6a" />
        <rect x={110} y={50} width={580} height={260} rx={4} fill="#2a2a2a" />
        {layers}
        {[220, 400, 580].map((x) => (
          <path key={x} d={`M${x},316 L${x},330 M${x - 10},48 L${x},34 L${x + 10},48`} stroke="#6f6f6a" strokeWidth={4} fill="none" />
        ))}
      </g>
    ),
  },
  {
    id: 'stand',
    name: 'Stand de feria',
    surfaces: [
      { x: 156, y: 56, width: 488, height: 298 },
      { x: 272, y: 318, width: 256, height: 104 },
    ],
    slots: [
      { x: 196, y: 80, width: 408, height: 170 },
      { x: 296, y: 336, width: 208, height: 70 },
    ],
    render: (layers) => (
      <g>
        <path d="M60,440 L740,440 L800,500 L0,500 Z" fill="#dcdcd7" />
        <rect x={140} y={40} width={520} height={330} rx={6} fill="#2a2a2a" />
        {layers[0]}
        <ellipse cx={400} cy={436} rx={170} ry={8} fill="#000" opacity={0.1} />
        <rect x={250} y={292} width={300} height={16} rx={3} fill="#2a2a2a" />
        <rect x={262} y={308} width={276} height={124} fill="#e9e9e5" />
        {layers[1]}
        <path d="M170,40 L170,22 L210,22 M630,40 L630,22 L590,22" stroke="#6f6f6a" strokeWidth={4} fill="none" />
      </g>
    ),
  },
  {
    id: 'rollup',
    name: 'Roll-up',
    surfaces: [{ x: 306, y: 36, width: 188, height: 390 }],
    slots: [{ x: 322, y: 70, width: 156, height: 150 }],
    render: (layers) => (
      <g>
        <rect x={0} y={448} width={800} height={52} fill="#dcdcd7" />
        <ellipse cx={400} cy={452} rx={150} ry={7} fill="#000" opacity={0.1} />
        <rect x={300} y={30} width={200} height={402} rx={3} fill="#2a2a2a" />
        {layers}
        <rect x={296} y={26} width={208} height={8} rx={4} fill="#3a3a3a" />
        <rect x={282} y={428} width={236} height={20} rx={10} fill="#3a3a3a" />
      </g>
    ),
  },
  {
    id: 'vehiculo',
    name: 'Vehículo',
    surfaces: [{ ...VAN_PANEL, rx: 10 }],
    slots: [{ x: VAN_PANEL.x + 24, y: VAN_PANEL.y + 22, width: VAN_PANEL.width - 48, height: VAN_PANEL.height - 44 }],
    render: (layers) => (
      <g>
        <rect x={0} y={440} width={800} height={60} fill="#dcdcd7" />
        <VanGraphic>{layers}</VanGraphic>
      </g>
    ),
  },
];

export const BOARD_COLORS = [
  { id: 'white', name: 'Blanco', value: '#ffffff', dark: false },
  { id: 'gray', name: 'Gris', value: '#d6d6d1', dark: false },
  { id: 'black', name: 'Negro', value: '#1c1c1c', dark: true },
];
