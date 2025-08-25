import React, { useEffect, useReducer, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Transition,
  UnstyledButton,
} from '@mantine/core';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react';
import { Template, TemplateTab } from '@pfiffkopf-webapp-office/pfk-pdf';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isOpen?: boolean;
  template: Template;
  onTabChanges?: (tabName: string | null) => void;
  pageIndex: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  isMobile,
  isTablet,
  isOpen,
  template,
  onTabChanges,
  pageIndex,
}) => {
  const showTwoColumns = !isMobile && !isTablet;

  const [showSettings, setShowSettings] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabs = Object.keys(template);
  const values = Object.values(template);
  const firstTab = findFirstTab();
  const [currentCategory, setCurrentTab] = useState<TemplateTab | null>(
    firstTab,
  );
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  function findFirstTab(): TemplateTab | null {
    for (let i = 0; i < tabs.length; i++) {
      if (
        typeof values[i] === 'object' &&
        values[i] !== null &&
        values[i] instanceof TemplateTab
      ) {
        const tab = values[i] as TemplateTab;
        if (tab instanceof TemplateTab) {
          const pages = tab.pageNumbers;
          if (
            (pages instanceof Array &&
              (pages as Array<number>).includes(pageIndex - 1)) ||
            (!(pages instanceof Array) &&
              ((pages as number) === -1 || (pages as number) === pageIndex - 1))
          ) {
            return tab;
          }
        }
      }
    }
    return null;
  }
  function PropertiesTab(props: {
    tab: TemplateTab | null;
    template: Template;
  }) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
      if (props.tab) {
        props.tab.setDataProperties(forceUpdate);
      }
    }, [props.tab]);

    return props.tab && props.tab.drawUI
      ? props.tab.drawUI({
          template: props.template,
          currentTab: props.tab.id,
        })
      : '';
  }
  function isCategoryVisible(idx: number): boolean {
    if (
      typeof values[idx] !== 'object' ||
      values[idx] === null ||
      !(values[idx] instanceof TemplateTab)
    ) {
      return false;
    }
    const pages = (values[idx] as TemplateTab).pageNumbers;
    return (
      (pages instanceof Array &&
        (pages as Array<number>).includes(pageIndex - 1)) ||
      (!(pages instanceof Array) &&
        ((pages as number) === -1 || (pages as number) === pageIndex - 1))
    );
  }
  const handleCategoryChange = (category: TemplateTab) => {
    if ((isMobile || isTablet) && !isAnimating) {
      setIsAnimating(true);
      setCurrentTab(category);

      // Kleine Verzögerung für visuellen Feedback
      setTimeout(() => {
        setShowSettings(true);
        setIsAnimating(false);
      }, 150);
    } else {
      setCurrentTab(category);
    }
  };
  const handleBackToMenu = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setShowSettings(false);
        setIsAnimating(false);
      }, 100);
    }
  };
  // Reset showSettings when sidebar closes
  useEffect(() => {
    if (!isOpen && isMobile) {
      setShowSettings(false);
      setIsAnimating(false);
    }
  }, [isOpen, isMobile]);
  useEffect(() => {
    template.setDataProperties(forceUpdate);
  }, [template]);
    const handleFinish = () => {
    setShowSettings(false);
    onClose?.();
  };

  if (isMobile || isTablet) {
    return (
      <Box
        h="100%"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'white',
        }}
      >
        {/* Category Selection View */}
        <Transition
          mounted={!showSettings}
          transition="slide-right"
          duration={300}
          timingFunction="ease-out"
        >
          {(styles) => (
            <Box
              style={{
                ...styles,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: showSettings ? 1 : 2,
              }}
            >
              <ScrollArea h="100%">
                <Box p="md">
                  <Group justify="space-between" mb="lg">
                    <Text size="xl" fw={700} c="dark">
                      Einstellungen
                    </Text>
                  </Group>
                  <Stack gap="md">
                    {tabs.map((_, index) => {
                      if (!isCategoryVisible(index)) return null;

                      const category = values[index] as TemplateTab;
                      const isActive = currentCategory?.id === category.id;
                      return (
                        <Box
                          key={category.id}
                          style={{
                            transform: `translateY(${index * 4}px)`,
                            transition: 'all 0.3s ease',
                            transitionDelay: `${index * 50}ms`,
                          }}
                        >
                          <UnstyledButton
                            onClick={() => handleCategoryChange(category)}
                            disabled={isAnimating}
                            style={{
                              width: '100%',
                              borderRadius: 'var(--mantine-radius-lg)',
                              background: isActive
                                ? 'var(--mantine-primary-color-filled)'
                                : 'var(--mantine-color-gray-0)',
                              color: isActive
                                ? 'var(--mantine-color-white)'
                                : 'var(--mantine-color-gray-8)',
                              transition:
                                'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: `2px solid ${isActive ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-2)'}`,
                              boxShadow: isActive
                                ? '0 8px 25px var(--mantine-primary-color-2)'
                                : '0 2px 8px rgba(0, 0, 0, 0.04)',
                              transform:
                                isAnimating &&
                                currentCategory?.id === category.id
                                  ? 'scale(0.98) translateX(8px)'
                                  : 'scale(1) translateX(0px)',
                              opacity: isAnimating ? 0.7 : 1,
                            }}
                            p="xl"
                          >
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="lg" wrap="nowrap">
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                  <Text
                                    size="lg"
                                    fw={600}
                                    lh={1.2}
                                    style={{
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    {category.displayName}
                                  </Text>
                                  <Text
                                    size="sm"
                                    opacity={isActive ? 0.9 : 0.7}
                                    lh={1.3}
                                    mt={4}
                                  >
                                    {category.description}
                                  </Text>
                                </Box>
                              </Group>
                              <IconChevronRight
                                size={20}
                                style={{
                                  opacity: 0.6,
                                  transition: 'transform 0.2s ease',
                                  transform:
                                    isAnimating &&
                                    currentCategory?.id === category.id
                                      ? 'translateX(4px)'
                                      : 'translateX(0px)',
                                }}
                              />
                            </Group>
                          </UnstyledButton>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </ScrollArea>
            </Box>
          )}
        </Transition>
        {/* Settings Detail View */}
        <Transition
          mounted={showSettings}
          transition="slide-left"
          duration={300}
          timingFunction="ease-out"
        >
          {(styles) => (
            <Box
              style={{
                ...styles,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: showSettings ? 2 : 1,
                background: 'white',
              }}
            >
              {/* Settings Header with Back Button */}
              <Paper
                p="md"
                style={{
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                  background: 'var(--mantine-primary-color-filled)',
                  color: 'var(--mantine-color-white)',
                }}
              >
                <Group justify="space-between" mb="sm">
                  <Group gap="sm">
                    <ActionIcon
                      variant="white"
                      color="blue"
                      onClick={handleBackToMenu}
                      size="lg"
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>
                    <Text size="lg" fw={600}>
                      Zurück
                    </Text>
                  </Group>
                  {isMobile && (
                    <ActionIcon
                      variant="white"
                      color="blue"
                      onClick={onClose}
                      size="lg"
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  )}
                </Group>

                {currentCategory && (
                  <Group gap="md" pl="xl">
                    <Box>
                      <Text size="lg" fw={600}>
                        {currentCategory.displayName}
                      </Text>
                      <Text size="sm" opacity={0.9}>
                        {currentCategory.description}
                      </Text>
                    </Box>
                  </Group>
                )}
              </Paper>

              {/* Settings Content */}
              <ScrollArea style={{ height: 'calc(100% - 140px)' }}>
                <Box
                  style={{
                    animation: showSettings
                      ? 'slideInContent 0.4s ease-out 0.1s both'
                      : 'none',
                  }}
                >
                    <PropertiesTab template={template} tab={currentCategory} />
                </Box>
              </ScrollArea>

              {/* Action Buttons */}
              <Paper
                p="md"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid var(--mantine-color-gray-2)',
                  background: 'white',
                  zIndex: 100,
                }}
              >
                <Group gap="sm">
                  <Button
                    variant="light"
                    onClick={handleBackToMenu}
                    flex={1}
                    size="md"
                    leftSection={
                      <IconChevronRight
                        size={16}
                        style={{ transform: 'rotate(180deg)' }}
                      />
                    }
                  >
                    Zurück zum Menü
                  </Button>
                  <Button
                    variant="filled"
                    onClick={handleFinish}
                    leftSection={<IconCheck size={16} />}
                    flex={1}
                    size="md"
                  >
                    Fertig
                  </Button>
                </Group>
              </Paper>
            </Box>
          )}
        </Transition>
        {/* CSS Keyframes für zusätzliche Animationen */}
        <style>
          {`
            @keyframes slideInContent {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </Box>
    );
  }

  return (
    <Box h="100%" style={{ display: 'flex' }}>
      {/* Navigation Panel */}
      <Box
        w={showTwoColumns ? 200 : '100%'}
        bg="gray.0"
        style={{
          borderRight: showTwoColumns
            ? '1px solid var(--mantine-color-gray-3)'
            : 'none',
        }}
      >
        <Box
          p={isTablet ? 'sm' : 'md'}
          bg="white"
          style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
        >
          <Group justify="space-between">
            <Text size={isTablet ? 'md' : 'lg'} fw={600} c="dark">
              Einstellungen
            </Text>
          </Group>
        </Box>
        <ScrollArea style={{ height: 'calc(100% - 60px)' }}>
          <Stack gap={2} p={isTablet ? 'xs' : 'sm'}>
            {tabs.map((_, idx) => {
              if (!isCategoryVisible(idx)) return null;

              const tabData = values[idx] as TemplateTab;
              const isActive = currentCategory?.id === tabData.id;

              return (
                <UnstyledButton
                  key={tabData.id}
                  p={isTablet ? 'sm' : 'md'}
                  style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    background: isActive
                      ? 'var(--mantine-primary-color-5)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--mantine-color-white)'
                      : 'var(--mantine-color-gray-6)',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive
                      ? '0 2px 8px var(--mantine-primary-color-7)'
                      : 'none',
                  }}
                  onClick={() => handleCategoryChange(tabData)}
                >
                  <Group gap={isTablet ? 'sm' : 'md'}>
                    <Box>
                      <Text size={isTablet ? 'xs' : 'sm'} fw={500} lh={1.3}>
                        {isTablet
                          ? tabData.shortDisplayName
                          : tabData.displayName}
                      </Text>
                      {!isTablet && (
                        <Text
                          size="xs"
                          opacity={isActive ? 0.8 : 0.6}
                          lh={1.2}
                          mt={2}
                        >
                          {tabData.description}
                        </Text>
                      )}
                    </Box>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </ScrollArea>
        {/* Finish Button for Tablet */}
        {isTablet && (
          <Paper
            p="sm"
            style={{
              borderTop: '1px solid var(--mantine-color-gray-2)',
              background: 'white',
            }}
          >
            <Button
              variant="filled"
              onClick={onClose}
              leftSection={<IconCheck size={16} />}
              fullWidth
              size="sm"
            >
              Fertig
            </Button>
          </Paper>
        )}
      </Box>
      {/* Content Panel - Only for desktop */}
      {showTwoColumns && (
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Content Header */}
          <Paper
            p="md"
            style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
          >
            <Group gap="md">
              <Box>
                <Text size="lg" fw={600} c="dark">
                  {currentCategory?.displayName}
                </Text>
                <Text size="sm" c="dimmed">
                  {currentCategory?.description}
                </Text>
              </Box>
            </Group>
          </Paper>

          {/* Content */}
          <ScrollArea style={{ flex: 1 }}>
            <Box style={{ background: '#fefefe' }}>
              <PropertiesTab template={template} tab={currentCategory} />
            </Box>
          </ScrollArea>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
