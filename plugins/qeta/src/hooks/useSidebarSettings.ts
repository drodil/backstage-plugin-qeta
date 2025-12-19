import { useLocalStorage } from 'react-use';

export const useSidebarSettings = () => {
  const [leftCompact, setLeftCompact] = useLocalStorage(
    'qeta-left-menu-compact',
    false,
  );
  const [rightCompact, setRightCompact] = useLocalStorage(
    'qeta-right-sidebar-compact',
    false,
  );

  const toggleLeft = () => setLeftCompact(!leftCompact);
  const toggleRight = () => setRightCompact(!rightCompact);

  return {
    leftCompact: !!leftCompact,
    rightCompact: !!rightCompact,
    toggleLeft,
    toggleRight,
  };
};
