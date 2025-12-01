import * as Menubar from '@radix-ui/react-menubar';
import type { Edge, Node } from 'reactflow';

import * as styles from '@/components/common/styles';
import type { UseNodeGraphResult } from '@/hooks/use-node-graph';
import * as files from '@/lib/files';
import * as serialize from '@/lib/graph/serialize';

export type ToolbarProps = {
  nodeGraph: UseNodeGraphResult;
  onLoadScene: (options: { nodes: Node[]; edges: Edge[] }) => void;
  onClearScene: () => void;
};

export default function Toolbar({ nodeGraph, onLoadScene, onClearScene }: ToolbarProps) {
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

  return (
    <div className="bg-zinc-900 text-zinc-400">
      <Menubar.Root>
        <Menubar.Menu>
          <MenubarTrigger>Graph</MenubarTrigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.selectViewport} align="start">
              <Menubar.Group>
                <MenubarItem
                  onSelect={saveNodeGraph}
                  iconClassName="icon-[tabler--device-floppy]"
                >
                  Save to file
                </MenubarItem>
                <MenubarItem
                  onSelect={() => {
                    void importNodeGraph();
                  }}
                  iconClassName="icon-[tabler--arrow-bar-up]"
                >
                  Import from file
                </MenubarItem>
              </Menubar.Group>
              <MenubarSeparator />
              <Menubar.Group>
                <MenubarItem onSelect={onClearScene} iconClassName="icon-[tabler--trash]">
                  Reset
                </MenubarItem>
              </Menubar.Group>
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

function MenubarSeparator() {
  return <Menubar.Separator className="m-1 h-px bg-zinc-600" />;
}
