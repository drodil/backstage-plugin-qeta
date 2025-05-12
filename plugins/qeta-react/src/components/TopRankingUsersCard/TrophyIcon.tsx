import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const TrophyIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      id="secondary"
      d="M17,12a1,1,0,0,1,0-2,3,3,0,0,0,3-3V6H17.17a1,1,0,0,1,0-2H20a2,2,0,0,1,2,2V7A5,5,0,0,1,17,12ZM8,11a1,1,0,0,0-1-1A3,3,0,0,1,4,7V6H6.74a1,1,0,0,0,0-2H4A2,2,0,0,0,2,6V7a5,5,0,0,0,5,5A1,1,0,0,0,8,11Zm5,10V16.18a1,1,0,0,0-2,0V21a1,1,0,0,0,2,0Z"
    />
    <path
      id="primary"
      d="M16,22H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2ZM17,2H7A1,1,0,0,0,6,3V9.57a7.75,7.75,0,0,0,4.89,7.22A3,3,0,0,0,12,17a3.13,3.13,0,0,0,1.12-.21A7.76,7.76,0,0,0,18,9.57V3A1,1,0,0,0,17,2Z"
    />
  </SvgIcon>
);
