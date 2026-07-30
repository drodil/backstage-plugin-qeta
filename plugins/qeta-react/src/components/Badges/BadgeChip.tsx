import { Badge } from '@drodil/backstage-plugin-qeta-common';
import { Box, Text } from '@backstage/ui';
import {
  RiStarFill,
  RiVerifiedBadgeLine,
  RiVerifiedBadgeFill,
  RiEyeLine,
  RiTrophyFill,
  RiQuestionLine,
  RiSearchLine,
  RiCustomerServiceLine,
  RiToolsLine,
  RiGraduationCapLine,
  RiBookOpenLine,
  RiThumbUpLine,
  RiChatCheckLine,
  RiFileTextLine,
  RiEditLine,
  RiLinkM,
  RiChat3Line,
  RiLayoutColumnLine,
  RiShareLine,
  RiGlobeLine,
  RiMegaphoneLine,
  RiScales3Line,
  RiNodeTree,
  RiHeadphoneLine,
  RiMedalFill,
  RiCheckboxCircleLine,
  RiCheckDoubleLine,
  RiSparklingLine,
  RiUserAddLine,
  RiLineChartLine,
  RiGroupLine,
  RiMoonLine,
  RiTranslate,
  RiBookmark2Line,
  RiBookShelfLine,
  RiArchiveLine,
  RiAddBoxLine,
  RiFolderFill,
  RiStarSFill,
  RiDiamondFill,
  RiFireFill,
  RiPaletteLine,
  RiCameraLine,
  RiPriceTag2Fill,
} from '@remixicon/react';
import styles from './BadgeChip.module.css';

const ICON_SIZE = 28;

const getIcon = (icon: string) => {
  switch (icon) {
    case 'star':
      return <RiStarFill size={ICON_SIZE} />;
    case 'local_police':
      return <RiVerifiedBadgeLine size={ICON_SIZE} />;
    case 'visibility':
      return <RiEyeLine size={ICON_SIZE} />;
    case 'workspace_premium':
      return <RiTrophyFill size={ICON_SIZE} />;
    case 'help':
      return <RiQuestionLine size={ICON_SIZE} />;
    case 'psychology':
      return <RiSearchLine size={ICON_SIZE} />;
    case 'support':
      return <RiCustomerServiceLine size={ICON_SIZE} />;
    case 'build':
      return <RiToolsLine size={ICON_SIZE} />;
    case 'school':
      return <RiGraduationCapLine size={ICON_SIZE} />;
    case 'menu_book':
      return <RiBookOpenLine size={ICON_SIZE} />;
    case 'cast_for_education':
      return <RiGraduationCapLine size={ICON_SIZE} />;
    case 'thumb_up':
      return <RiThumbUpLine size={ICON_SIZE} />;
    case 'rate_review':
      return <RiChatCheckLine size={ICON_SIZE} />;
    case 'article':
      return <RiFileTextLine size={ICON_SIZE} />;
    case 'history_edu':
      return <RiEditLine size={ICON_SIZE} />;
    case 'link':
      return <RiLinkM size={ICON_SIZE} />;
    case 'comment':
      return <RiChat3Line size={ICON_SIZE} />;
    case 'view_column':
      return <RiLayoutColumnLine size={ICON_SIZE} />;
    case 'share':
      return <RiShareLine size={ICON_SIZE} />;
    case 'public':
      return <RiGlobeLine size={ICON_SIZE} />;
    case 'record_voice_over':
      return <RiMegaphoneLine size={ICON_SIZE} />;
    case 'campaign':
      return <RiMegaphoneLine size={ICON_SIZE} />;
    case 'gavel':
      return <RiScales3Line size={ICON_SIZE} />;
    case 'device_hub':
      return <RiNodeTree size={ICON_SIZE} />;
    case 'hearing':
      return <RiHeadphoneLine size={ICON_SIZE} />;
    case 'military_tech':
      return <RiMedalFill size={ICON_SIZE} />;
    case 'verified':
      return <RiVerifiedBadgeFill size={ICON_SIZE} />;
    case 'check_circle':
      return <RiCheckboxCircleLine size={ICON_SIZE} />;
    case 'done_all':
      return <RiCheckDoubleLine size={ICON_SIZE} />;
    case 'construction':
      return <RiToolsLine size={ICON_SIZE} />;
    case 'auto_fix_high':
      return <RiSparklingLine size={ICON_SIZE} />;
    case 'person_add':
      return <RiUserAddLine size={ICON_SIZE} />;
    case 'trending_up':
      return <RiLineChartLine size={ICON_SIZE} />;
    case 'emoji_events':
      return <RiTrophyFill size={ICON_SIZE} />;
    case 'groups':
      return <RiGroupLine size={ICON_SIZE} />;
    case 'nights_stay':
      return <RiMoonLine size={ICON_SIZE} />;
    case 'auto_stories':
      return <RiBookShelfLine size={ICON_SIZE} />;
    case 'translate':
      return <RiTranslate size={ICON_SIZE} />;
    case 'chat_bubble':
      return <RiChat3Line size={ICON_SIZE} />;
    // Collection badges
    case 'collections_bookmark':
      return <RiBookmark2Line size={ICON_SIZE} />;
    case 'local_library':
      return <RiBookShelfLine size={ICON_SIZE} />;
    case 'archive':
      return <RiArchiveLine size={ICON_SIZE} />;
    case 'playlist_add':
      return <RiAddBoxLine size={ICON_SIZE} />;
    case 'folder_special':
      return <RiFolderFill size={ICON_SIZE} />;
    case 'inventory':
      return <RiArchiveLine size={ICON_SIZE} />;
    case 'star_rate':
      return <RiStarSFill size={ICON_SIZE} />;
    case 'diamond':
      return <RiDiamondFill size={ICON_SIZE} />;
    case 'whatshot':
      return <RiFireFill size={ICON_SIZE} />;
    case 'palette':
      return <RiPaletteLine size={ICON_SIZE} />;
    case 'camera_alt':
      return <RiCameraLine size={ICON_SIZE} />;
    case 'label_important':
      return <RiPriceTag2Fill size={ICON_SIZE} />;
    default:
      return <RiVerifiedBadgeLine size={ICON_SIZE} />;
  }
};

export const BadgeChip = ({
  badge,
  count,
}: {
  badge: Badge;
  count?: number;
}) => {
  const icon = getIcon(badge.icon);

  return (
    <Box className={`${styles.badge} ${styles[badge.level]}`}>
      <Box className={styles.icon}>{icon}</Box>
      <Text className={styles.name}>{badge.name}</Text>
      <Text className={styles.level}>{badge.level}</Text>
      <Text className={styles.description}>{badge.description}</Text>
      {count && count > 1 && <Box className={styles.count}>x {count}</Box>}
    </Box>
  );
};
