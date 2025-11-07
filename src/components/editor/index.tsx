import { useState } from 'react';

import MainCanvas from './main-canvas';

export default function Editor() {
  // @ts-expect-error not setting this yet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sceneGraph, setSceneGraph] = useState({ foo: 'bar' });

  // the above state could come from a number of places... we could store it in the URL even!

  return (
    <div className="absolute inset-0">
      <MainCanvas sceneGraph={sceneGraph} />
    </div>
  );
}
