import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {isAuthenticated ? (
            <>
              <span className="mr-2">{user?.name}</span>
              <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className="mr-2">Account</span>
              <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-50">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <Link
                      to="/profile"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                      } flex items-center px-4 py-2 text-sm`}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <Link
                      to="/settings"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                      } flex items-center px-4 py-2 text-sm`}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }: { active: boolean }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                      } flex items-center w-full text-left px-4 py-2 text-sm`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </>
          ) : (
            <div className="py-1">
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <Link
                    to="/login"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                    } flex items-center px-4 py-2 text-sm`}
                  >
                    Sign in
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <Link
                    to="/register"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                    } flex items-center px-4 py-2 text-sm`}
                  >
                    Create account
                  </Link>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu; 