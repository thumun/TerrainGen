import * as Menubar from '@radix-ui/react-menubar';
import { clsx } from 'clsx';

import * as styles from '@/components/common/styles';
import type { UseNodeGraphResult } from '@/hooks/use-node-graph';

export type ToolbarProps = {
  nodeGraph: UseNodeGraphResult;
};

export default function Toolbar({ nodeGraph }: ToolbarProps) {
  return (
    <div className="bg-zinc-900 text-zinc-400">
      <Menubar.Root>
        <Menubar.Menu>
          <MenubarTrigger>File</MenubarTrigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.selectViewport} align="start">
              <MenubarItem
                onSelect={() => {
                  console.log(nodeGraph.nodes);
                }}
                iconClassName="icon-[tabler--device-floppy]"
              >
                Save node graph
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  console.log(nodeGraph.nodes);
                }}
                iconClassName="icon-[tabler--arrow-bar-up]"
              >
                Import node graph from file
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
