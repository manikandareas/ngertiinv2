import { AnimatePresence, motion, type Transition } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import React, { type ComponentRef } from 'react';
import { useParams } from 'react-router';
import { useOnClickOutside } from 'usehooks-ts';
import { cn } from '~/lib/utils';

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
  alwaysVisible?: boolean;
}

interface Separator {
  type: 'separator';
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: '.5rem',
    paddingRight: '.5rem',
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? '.5rem' : 0,
    paddingLeft: isSelected ? '1rem' : '.5rem',
    paddingRight: isSelected ? '1rem' : '.5rem',
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: 'spring', bounce: 0, duration: 0.6 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = 'text-primary',
  onChange,
}: ExpandableTabsProps) {
  const { slug, chapterSlug, quizSlug, lessonSlug } = useParams<{
    slug: string;
    chapterSlug: string;
    quizSlug: string | undefined;
    lessonSlug: string | undefined;
  }>();
  const [selected, setSelected] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<ComponentRef<'div'>>(null);

  useOnClickOutside(outsideClickRef as React.RefObject<HTMLDivElement>, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm',
        className
      )}
      ref={outsideClickRef}
    >
      {tabs.map((tab, index) => {
        if (tab.type === 'separator') {
          return <Separator key={`separator-${index.toString()}`} />;
        }

        const Icon = tab.icon;

        if (tab.alwaysVisible) {
          return (
            <motion.button
              animate="animate"
              className={cn(
                'relative flex items-center rounded-xl px-4 py-2 font-medium text-sm transition-colors duration-300',
                cn('bg-muted', activeColor)
              )}
              custom={selected === index}
              initial={false}
              key={tab.title}
              onClick={() => handleSelect(index)}
              transition={transition as Transition}
              variants={buttonVariants}
            >
              <AnimatePresence initial={false}>
                <motion.span
                  animate="animate"
                  className="overflow-hidden"
                  exit="exit"
                  initial="initial"
                  transition={transition as Transition}
                  variants={spanVariants}
                >
                  {tab.title}
                </motion.span>
              </AnimatePresence>
              <Icon size={20} />
            </motion.button>
          );
        }
        return (
          <motion.button
            animate="animate"
            className={cn(
              'relative flex items-center rounded-xl px-4 py-2 font-medium text-sm transition-colors duration-300',
              selected === index
                ? cn('bg-muted', activeColor)
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            custom={selected === index}
            initial={false}
            key={tab.title}
            onClick={() => handleSelect(index)}
            transition={transition as Transition}
            variants={buttonVariants}
          >
            <Icon size={20} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  animate="animate"
                  className="overflow-hidden"
                  exit="exit"
                  initial="initial"
                  transition={transition as Transition}
                  variants={spanVariants}
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

const Separator = () => (
  <div aria-hidden="true" className="mx-1 h-[24px] w-[1.2px] bg-border" />
);
