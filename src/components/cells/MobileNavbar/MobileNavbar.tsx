'use client';

import { HttpTypes } from '@medusajs/types';
import {
  CategoryNavbar,
  HeaderCategoryNavbar,
} from '@/components/molecules';
import { CloseIcon, HamburgerMenuIcon } from '@/icons';
import { useState } from 'react';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export const MobileNavbar = ({
  childrenCategories,
  parentCategories,
}: {
  childrenCategories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const [openMenu, setOpenMenu] = useState(false);

  const closeMenuHandler = () => {
    setOpenMenu(false);
  };

  return (
    <div className='lg:hidden'>
      <div onClick={() => setOpenMenu(true)}>
        <HamburgerMenuIcon />
      </div>
      {openMenu && (
        <div className='fixed w-full h-full bg-primary p-2 top-0 left-0 z-20'>
          <div className='flex justify-end'>
            <div onClick={() => closeMenuHandler()}>
              <CloseIcon size={20} />
            </div>
          </div>
          {/* Main nav links */}
          <nav className='flex flex-col gap-1 mt-4 mb-4'>
            {[
              { href: '/categories', label: 'Shop' },
              { href: '/directory', label: 'Directory' },
              { href: '/networking', label: 'Events' },
              { href: '/barter', label: 'Barter' },
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
        </div>
      )}
    </div>
  );
};
