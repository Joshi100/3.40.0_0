import React, { useState } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';

interface DraggableComponentProps {
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  onDragEnd?: (position: { x: number; y: number }) => void;
  className?: string;
  dragConstraints?: { top: number; left: number; right: number; bottom: number };
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  children,
  defaultPosition = { x: 0, y: 0 },
  onDragEnd,
  className = '',
  dragConstraints
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd({ x: info.point.x, y: info.point.y });
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={defaultPosition}
      className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

export default DraggableComponent;