import { Badge } from '@drodil/backstage-plugin-qeta-common';
import { Box, Typography, makeStyles } from '@material-ui/core';
import Star from '@material-ui/icons/Star';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import Visibility from '@material-ui/icons/Visibility';
import EmojiEvents from '@material-ui/icons/EmojiEvents';
import Help from '@material-ui/icons/Help';
import Search from '@material-ui/icons/Search';
import Support from '@material-ui/icons/ContactSupport';
import Build from '@material-ui/icons/Build';
import School from '@material-ui/icons/School';
import MenuBook from '@material-ui/icons/MenuBook';
import CastForEducation from '@material-ui/icons/CastForEducation';
import ThumbUp from '@material-ui/icons/ThumbUp';
import RateReview from '@material-ui/icons/RateReview';
import Article from '@material-ui/icons/Description';
import Create from '@material-ui/icons/Create';
import Link from '@material-ui/icons/Link';
import Comment from '@material-ui/icons/Comment';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Share from '@material-ui/icons/Share';
import Public from '@material-ui/icons/Public';
import RecordVoiceOver from '@material-ui/icons/RecordVoiceOver';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import Gavel from '@material-ui/icons/Gavel';
import DeviceHub from '@material-ui/icons/DeviceHub';
import Hearing from '@material-ui/icons/Hearing';
import Stars from '@material-ui/icons/Stars';
import Flare from '@material-ui/icons/Flare';
import CheckCircle from '@material-ui/icons/CheckCircle';
import DoneAll from '@material-ui/icons/DoneAll';
import PersonAdd from '@material-ui/icons/PersonAdd';
import TrendingUp from '@material-ui/icons/TrendingUp';
import Group from '@material-ui/icons/Group';
import NightsStay from '@material-ui/icons/NightsStay';
import ChatBubble from '@material-ui/icons/ChatBubble';
import Translate from '@material-ui/icons/Translate';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CollectionsBookmark from '@material-ui/icons/CollectionsBookmark';
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import Archive from '@material-ui/icons/Archive';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';
import FolderSpecial from '@material-ui/icons/FolderSpecial';
import StarRate from '@material-ui/icons/StarRate';
import Whatshot from '@material-ui/icons/Whatshot';
import Palette from '@material-ui/icons/Palette';
import CameraAlt from '@material-ui/icons/CameraAlt';
import LabelImportant from '@material-ui/icons/LabelImportant';

const useStyles = makeStyles(theme => ({
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 2,
    width: '100%',
    minHeight: 140,
    height: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    userSelect: 'none',
    position: 'relative',
  },
  count: {
    position: 'absolute',
    top: 18,
    right: -12,
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    borderRadius: '2px',
    display: 'flex',
    padding: '4px',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  bronze: {
    background: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
    color: '#ffffff',
  },
  silver: {
    background: 'linear-gradient(135deg, #e8e8e8 0%, #a8a8a8 100%)',
    color: '#333333',
  },
  gold: {
    background: 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)',
    color: '#333333',
  },
  diamond: {
    background: 'linear-gradient(135deg, #b9f2ff 0%, #7ec8e3 100%)',
    color: '#1a365d',
  },
  icon: {
    fontSize: 28,
    marginBottom: theme.spacing(0.5),
  },
  name: {
    fontWeight: 600,
    fontSize: '0.85rem',
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.5),
  },
  level: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.85,
    marginBottom: theme.spacing(0.5),
  },
  description: {
    fontSize: '0.7rem',
    lineHeight: 1.3,
    opacity: 0.9,
  },
}));

const getIcon = (icon: string) => {
  switch (icon) {
    case 'star':
      return <Star />;
    case 'local_police':
      return <VerifiedUser />;
    case 'visibility':
      return <Visibility />;
    case 'workspace_premium':
      return <EmojiEvents />;
    case 'help':
      return <Help />;
    case 'psychology':
      return <Search />;
    case 'support':
      return <Support />;
    case 'build':
      return <Build />;
    case 'school':
      return <School />;
    case 'menu_book':
      return <MenuBook />;
    case 'cast_for_education':
      return <CastForEducation />;
    case 'thumb_up':
      return <ThumbUp />;
    case 'rate_review':
      return <RateReview />;
    case 'article':
      return <Article />;
    case 'history_edu':
      return <Create />;
    case 'link':
      return <Link />;
    case 'comment':
      return <Comment />;
    case 'view_column':
      return <ViewColumn />;
    case 'share':
      return <Share />;
    case 'public':
      return <Public />;
    case 'record_voice_over':
      return <RecordVoiceOver />;
    case 'campaign':
      return <SpeakerNotes />;
    case 'gavel':
      return <Gavel />;
    case 'device_hub':
      return <DeviceHub />;
    case 'hearing':
      return <Hearing />;
    case 'military_tech':
      return <Stars />;
    case 'verified':
      return <VerifiedUser />;
    case 'check_circle':
      return <CheckCircle />;
    case 'done_all':
      return <DoneAll />;
    case 'construction':
      return <Build />;
    case 'auto_fix_high':
      return <Flare />;
    case 'person_add':
      return <PersonAdd />;
    case 'trending_up':
      return <TrendingUp />;
    case 'emoji_events':
      return <EmojiEvents />;
    case 'groups':
      return <Group />;
    case 'nights_stay':
      return <NightsStay />;
    case 'auto_stories':
      return <LibraryBooks />;
    case 'translate':
      return <Translate />;
    case 'chat_bubble':
      return <ChatBubble />;
    // Collection badges
    case 'collections_bookmark':
      return <CollectionsBookmark />;
    case 'local_library':
      return <LocalLibrary />;
    case 'archive':
      return <Archive />;
    case 'playlist_add':
      return <PlaylistAdd />;
    case 'folder_special':
      return <FolderSpecial />;
    case 'inventory':
      return <Archive />;
    case 'star_rate':
      return <StarRate />;
    case 'diamond':
      return <Stars />;
    case 'whatshot':
      return <Whatshot />;
    case 'palette':
      return <Palette />;
    case 'camera_alt':
      return <CameraAlt />;
    case 'label_important':
      return <LabelImportant />;
    default:
      return <VerifiedUser />;
  }
};

export const BadgeChip = ({
  badge,
  count,
}: {
  badge: Badge;
  count?: number;
}) => {
  const classes = useStyles();
  const IconComponent = getIcon(badge.icon);

  return (
    <Box className={`${classes.badge} ${classes[badge.level]}`}>
      <Box className={classes.icon}>{IconComponent}</Box>
      <Typography className={classes.name}>{badge.name}</Typography>
      <Typography className={classes.level}>{badge.level}</Typography>
      <Typography className={classes.description}>
        {badge.description}
      </Typography>
      {count && count > 1 && <Box className={classes.count}>x {count}</Box>}
    </Box>
  );
};
