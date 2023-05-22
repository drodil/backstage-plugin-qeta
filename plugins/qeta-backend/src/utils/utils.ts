import { subDays, format } from 'date-fns';

export const stringDateTime = (dayString: string) => {
  const dateTimePeriod = Number(dayString.toString().slice(0, -1));

  const formattedDate = format(
    subDays(new Date(), dateTimePeriod),
    'yyyy-MM-dd',
  );

  return formattedDate;
};
