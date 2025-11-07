import { useState } from 'react';
import { MainCanvas } from './main-canvas';

export default function Editor() {
  const [sceneGraph, _setSceneGraph] = useState({ foo: 'bar' });

  return (
    <div className="absolute inset-0">
      <MainCanvas sceneGraph={sceneGraph} />
    </div>
  );
}
