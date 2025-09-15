import { ReactElement, useState } from 'react';
import { AppShell, Burger } from '@mantine/core';

import { Template, ViewProperties } from '@pfiffkopf-webapp-office/pfk-pdf';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Header from './header';
import Sidebar from './sidebar';
import MainCanvas from './main_canvas';

export interface EditorPropertys {
  view?: ReactElement<ViewProperties>;
  template: Template;
}

export function Editor(properties: EditorPropertys) {
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const getSidebarWidth = () => {
    if (isMobile) return 320;
    if (isTablet) return 450;
    return 600;
  };

  const [currentPropertiesTab, setCurrentPropertiesTab] = useState<
    string | null
  >('');
  const [currentPage, setCurrentPage] = useState(1);

  const pages = properties.template.drawPaper({
    currentTab: '',
    pdfRenderer: false,
  });
  const maxPages = pages instanceof Array ? pages.length : 1;

  return (
    <AppShell
      navbar={{
        width: getSidebarWidth(),
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: false },
      }}
      header={{ height: { base: 60, md: 70 } }}
      padding={0}
      styles={{
        main: {
          height: '100vh',
          overflow: 'hidden',
        },
      }}
    >
      <AppShell.Header>
        <Header
          burger={<Burger opened={opened} onClick={toggle} hiddenFrom="md" />}
          isMobile={isMobile}
          currentPage={currentPage}
          maxPages={maxPages}
          setCurrentPage={setCurrentPage}
          template={properties.template}
        />
      </AppShell.Header>
      <AppShell.Navbar>
        <Sidebar
          onClose={close}
          isMobile={isMobile}
          isTablet={isTablet}
          isOpen={opened}
          template={properties.template}
          pageIndex={currentPage}
          onTabChanges={(n) => {
            if (currentPropertiesTab !== n) {
              setCurrentPropertiesTab(n);
            }
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <MainCanvas
          isMobile={isMobile}
          isTablet={isTablet}
          template={properties.template}
          currentSelectedPropertiesTab={currentPropertiesTab || ''}
          currentPage={currentPage}
        />
      </AppShell.Main>
    </AppShell>
  );
}
