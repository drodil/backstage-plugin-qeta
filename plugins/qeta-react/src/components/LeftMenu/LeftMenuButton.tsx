import { useState } from 'react';
import { Button, DialogTrigger, Popover } from '@backstage/ui';
import { LeftMenu } from './LeftMenu';
import { RiMenuLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import styles from './LeftMenuButton.module.css';

export const LeftMenuButton = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="primary"
        iconStart={<RiMenuLine size={16} />}
        className={styles.button}
      >
        {t('leftMenu.buttonLabel')}
      </Button>
      <Popover placement="bottom start" className={styles.popover}>
        <LeftMenu onClick={() => setOpen(false)} inPopup />
      </Popover>
    </DialogTrigger>
  );
};
