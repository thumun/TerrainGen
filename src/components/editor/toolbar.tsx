import * as Menubar from '@radix-ui/react-menubar';
import type { Edge, Node } from 'reactflow';

import * as styles from '@/components/common/styles';
import type { UseNodeGraphResult } from '@/hooks/use-node-graph';
import * as files from '@/lib/files';
import * as serialize from '@/lib/graph/serialize';
import type { TerrainRenderer } from '@/lib/renderers/terrain-renderer';

export type ToolbarProps = {
  nodeGraph: UseNodeGraphResult;
  onLoadScene: (options: { nodes: Node[]; edges: Edge[] }) => void;
  terrainRendererRef?: React.RefObject<TerrainRenderer | undefined>;
};

export default function Toolbar({ nodeGraph, onLoadScene, terrainRendererRef }: ToolbarProps) {
  const saveNodeGraph = () => {
    const serializedGraph = serialize.serializeReactFlowNodeGraph(nodeGraph);
    files.downloadStringAsFile({
      filename: `nodegraph-${Math.floor(Date.now() / 1000).toString(16)}.tgen.json`,
      content: serializedGraph,
    });
  };

  // TODO: trigger full pipeline recreations for TerrainRenderer
  const importNodeGraph = async () => {
    const serializedGraph = await files.uploadFileToString({ accept: '.json' });
    const result = serialize.deserializeReactFlowNodeGraph(serializedGraph);
    if (!result.success) {
      alert(`Error loading scene: ${result.message}!`);
      return;
    }
    nodeGraph.setNodes(result.graph.nodes);
    nodeGraph.setEdges(result.graph.edges);

    onLoadScene({ nodes: result.graph.nodes, edges: result.graph.edges });
  };

  const uploadSkybox = async () => {
    try {
      const arrayBuffer = await files.uploadFileToArrayBuffer({ accept: '.hdr' });
      const url = URL.createObjectURL(new Blob([arrayBuffer]));
      await terrainRendererRef?.current?.load_skybox(url);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to load skybox:', error);
      alert('Failed to load skybox. Please try again.');
    }
  };

  return (
    <div className="bg-zinc-900 text-zinc-400">
      <Menubar.Root>
        <Menubar.Menu>
          <MenubarTrigger>File</MenubarTrigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.selectViewport} align="start">
              <MenubarItem
                onSelect={saveNodeGraph}
                iconClassName="icon-[tabler--device-floppy]"
              >
                Save node graph
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  void importNodeGraph();
                }}
                iconClassName="icon-[tabler--arrow-bar-up]"
              >
                Import node graph from file
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  void uploadSkybox();
                }}
                iconClassName="icon-[tabler--photo]"
              >
                Upload skybox (.hdr)
              </MenubarItem>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </div>
  );
}

type MenubarTriggerProps = {
  children?: React.ReactNode;
  underConstruction?: boolean;
};

function MenubarTrigger({ children, underConstruction }: MenubarTriggerProps) {
  return (
    <Menubar.Trigger
      disabled={underConstruction}
      className="radix-state-open:bg-zinc-800/60 radix-state-open:text-zinc-100 px-4 py-2 hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:outline-none"
    >
      {children}
    </Menubar.Trigger>
  );
}

type MenubarItemProps = {
  children?: React.ReactNode;
  onSelect?: () => void;
  underConstruction?: boolean;
  iconClassName?: string;
};

function MenubarItem({
  children,
  onSelect,
  underConstruction,
  iconClassName,
}: MenubarItemProps) {
  return (
    <Menubar.Item
      onSelect={onSelect}
      disabled={underConstruction}
      className={styles.selectOption}
    >
      {underConstruction && !iconClassName && '🏗️ '}
      {!underConstruction && iconClassName && <span className={iconClassName} />}
      {children}
    </Menubar.Item>
  );
}
