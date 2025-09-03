import React, { useEffect, useReducer } from 'react';
import { Box, Group, Text, Paper, ActionIcon, ScrollArea } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Template } from '@pfiffkopf-webapp-office/pfk-pdf';

interface MainCanvasProps {
  isMobile?: boolean;
  isTablet?: boolean;
  template: Template;
  currentSelectedPropertiesTab: string;
  currentPage: number;
  onValueChanged?: () => unknown;
}

const MainCanvas: React.FC<MainCanvasProps> = ({
  isMobile,
  isTablet,
  template,
  currentSelectedPropertiesTab,
  onValueChanged,
  currentPage,
}) => {
  const pages = template.drawPaper({
    currentTab:
      currentSelectedPropertiesTab !== undefined
        ? currentSelectedPropertiesTab
        : 'undefined',
    pdfRenderer: true,
    templateValuesChanged: () => {
      if (onValueChanged) {
        onValueChanged();
      }
    },
  });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (template != null) {
      template.setDataView(forceUpdate);
    }
  }, [template]);
  const page = pages instanceof Array ? pages[currentPage - 1] : pages;
  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper
        p={isMobile ? 'sm' : 'md'}
        shadow="xs"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
      >
        <Group justify="flex-end">
          <Group gap={isMobile ? 'xs' : 'md'}>
            <ActionIcon variant="light" size={isMobile ? 'md' : 'lg'}>
              <IconMinus size={14} />
            </ActionIcon>
            <Text size={isMobile ? 'xs' : 'sm'} fw={500}>
              {isMobile ? '100%' : '100%'}
            </Text>
            <ActionIcon variant="light" size={isMobile ? 'md' : 'lg'}>
              <IconPlus size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Canvas Area */}
      <ScrollArea
        viewportProps={{ style: { flex: 1, height: '100%' } }}
        style={{ background: '#f1f5f9', userSelect: 'none' }}
      >
        <Box
          p={isMobile ? 10 : isTablet ? 20 : 40}
          style={{
            //background: '#f1f5f9',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100%',
            minWidth: '100%',
          }}
        >
          <div>{page}</div>
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default MainCanvas;
/*
height: "max-content", width: "max-content"
<ScrollArea 
        viewportProps={{style: { height: "100%", width: "100%" }}}
      >
        <Box
          p={isMobile ? 10 : isTablet ? 20 : 40}
          style={{
            background: '#f1f5f9',
            //display: 'flex',
            justifyContent: 'center',
            //minHeight: '100%',
            //minWidth: "100%"
            
          }}
        >
           {page}
        </Box>
      </ScrollArea>

*/
