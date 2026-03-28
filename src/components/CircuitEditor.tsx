import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import { Plus, Trash2, Zap, Save, Share2 } from 'lucide-react';

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export default function CircuitEditor({ initialCircuit, onSave }: { initialCircuit?: any, onSave: (circuit: any) => void }) {
  const [components, setComponents] = useState<Component[]>(initialCircuit?.components || []);
  const [connections, setConnections] = useState<Connection[]>(initialCircuit?.connections || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const addComponent = (type: string) => {
    const newComp: Component = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100,
      y: 100,
      color: type === 'Arduino' ? '#00979C' : type === 'LED' ? '#FF0000' : '#888888',
    };
    setComponents([...components, newComp]);
  };

  const handleDragEnd = (id: string, e: any) => {
    setComponents(components.map(c => c.id === id ? { ...c, x: e.target.x(), y: e.target.y() } : c));
  };

  const handleConnect = (id: string) => {
    if (isConnecting && isConnecting !== id) {
      setConnections([...connections, { id: `${isConnecting}-${id}`, fromId: isConnecting, toId: id }]);
      setIsConnecting(null);
    } else {
      setIsConnecting(id);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setComponents(components.filter(c => c.id !== selectedId));
      setConnections(connections.filter(conn => conn.fromId !== selectedId && conn.toId !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-white border-bottom">
        <div className="flex gap-2">
          <button onClick={() => addComponent('Arduino')} className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
            <Plus size={16} /> Arduino
          </button>
          <button onClick={() => addComponent('LED')} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
            <Plus size={16} /> LED
          </button>
          <button onClick={() => addComponent('Sensor')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Sensor
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={deleteSelected} disabled={!selectedId} className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50">
            <Trash2 size={20} />
          </button>
          <button onClick={() => onSave({ components, connections })} className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
            <Save size={16} /> Save Circuit
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-100">
        <Stage width={window.innerWidth * 0.6} height={600}>
          <Layer>
            {/* Grid Lines */}
            {[...Array(20)].map((_, i) => (
              <Line key={`v-${i}`} points={[i * 50, 0, i * 50, 600]} stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {[...Array(12)].map((_, i) => (
              <Line key={`h-${i}`} points={[0, i * 50, 1200, i * 50]} stroke="#e2e8f0" strokeWidth={1} />
            ))}

            {/* Connections */}
            {connections.map(conn => {
              const from = components.find(c => c.id === conn.fromId);
              const to = components.find(c => c.id === conn.toId);
              if (!from || !to) return null;
              return (
                <Line
                  key={conn.id}
                  points={[from.x + 40, from.y + 20, to.x + 40, to.y + 20]}
                  stroke="#475569"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}

            {/* Components */}
            {components.map(comp => (
              <Group
                key={comp.id}
                x={comp.x}
                y={comp.y}
                draggable
                onDragEnd={(e) => handleDragEnd(comp.id, e)}
                onClick={() => setSelectedId(comp.id)}
              >
                <Rect
                  width={80}
                  height={40}
                  fill={comp.color}
                  cornerRadius={4}
                  stroke={selectedId === comp.id ? '#3b82f6' : 'transparent'}
                  strokeWidth={2}
                  shadowBlur={selectedId === comp.id ? 10 : 0}
                  shadowColor="#3b82f6"
                />
                <Text
                  text={comp.type}
                  width={80}
                  height={40}
                  align="center"
                  verticalAlign="middle"
                  fill="white"
                  fontSize={12}
                  fontStyle="bold"
                />
                {/* Connection Points */}
                <Circle
                  x={40}
                  y={20}
                  radius={6}
                  fill={isConnecting === comp.id ? '#fbbf24' : '#ffffff'}
                  stroke="#475569"
                  strokeWidth={1}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    handleConnect(comp.id);
                  }}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
        {isConnecting && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200 animate-pulse">
            Select another component to connect...
          </div>
        )}
      </div>
    </div>
  );
}
