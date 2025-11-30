import * as Menubar from '@radix-ui/react-menubar';
import { clsx } from 'clsx';

import * as styles from '@/components/common/styles';

export default function Toolbar() {
  return (
    <div className="bg-zinc-900 text-zinc-400">
      <Menubar.Root>
        <Menubar.Menu>
          <MenubarTrigger>File</MenubarTrigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.selectViewport} align="start">
              <MenubarItem
                onSelect={() => {
                  console.log('hello!');
                }}
              >
                Save node graph
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  console.log('hello!');
                }}
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
      className="cursor-pointer px-4 py-2 hover:bg-zinc-800/60"
    >
      {children}
    </Menubar.Trigger>
  );
}

type MenubarItemProps = {
  children?: React.ReactNode;
  onSelect?: () => void;
  underConstruction?: boolean;
  className?: string;
};

function MenubarItem({ children, onSelect, underConstruction, className }: MenubarItemProps) {
  return (
    <Menubar.Item
      onSelect={onSelect}
      disabled={underConstruction}
      className={clsx(styles.selectOption, className)}
    >
      {underConstruction && '🏗️ '}
      {children}
    </Menubar.Item>
  );
}
