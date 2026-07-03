'use client';

import { HttpTypes } from '@medusajs/types';
import {
  CategoryNavbar,
  HeaderCategoryNavbar,
} from '@/components/molecules';
import { CloseIcon, HamburgerMenuIcon } from '@/icons';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export const MobileNavbar = ({
  childrenCategories,
  parentCategories,
}: {
  childrenCategories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  // Portal target only exists client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const closeMenuHandler = () => {
    setOpenMenu(false);
  };

  return (
    <div className='lg:hidden'>
      <button
        type='button'
        aria-label='Open menu'
        aria-expanded={openMenu}
        aria-controls='mobile-menu'
        onClick={() => setOpenMenu(true)}
      >
        <HamburgerMenuIcon />
      </button>
      {/* Portaled to <body>: the header's backdrop-blur makes it a containing
          block for fixed descendants on iOS Safari, so rendered in place this
          "full-screen" panel was only header-tall — a white strip showing just
          the X and the first link, page visible beneath (Matteo 7/3). */}
      {openMenu && mounted && createPortal(
        <div
          id='mobile-menu'
          role='dialog'
          aria-modal='true'
          aria-label='Menu'
          /* z-[60] sits ABOVE the sticky header (z-50). The header has a
             translucent (0.95) blurred background, so a lower z-index let the
             menu show through it — the "transparency" bug. The panel's own
             bg-primary is fully opaque; overflow-y-auto keeps long category
             lists scrollable on short screens. */
          className='lg:hidden fixed w-full h-full bg-primary p-2 top-0 left-0 z-[60] overflow-y-auto'
        >
          <div className='flex justify-end'>
            <button
              type='button'
              aria-label='Close menu'
              onClick={() => closeMenuHandler()}
            >
              <CloseIcon size={20} />
            </button>
          </div>
          {/* Main nav links */}
          <nav className='flex flex-col gap-1 mt-4 mb-4'>
            {[
              { href: '/categories', label: 'Shop' },
              { href: '/directory', label: 'Directory' },
              { href: '/networking', label: 'Events' },
              { href: '/trade', label: 'Trade' },
            ].map(({ href, label }) => (
              <LocalizedClientLink
                key={href}
                href={href}
                onClick={closeMenuHandler}
                className='px-4 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-primary hover:text-action transition-colors'
              >
                {label}
              </LocalizedClientLink>
            ))}
          </nav>
          <div className='border mt-2 rounded-sm'>
            <HeaderCategoryNavbar
              onClose={closeMenuHandler}
              categories={parentCategories}
            />
            <div className='border-t pt-2'>
              <CategoryNavbar
                onClose={closeMenuHandler}
                categories={childrenCategories}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
