import React from 'react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

declare const MobileMenu: React.FC<MobileMenuProps>;

export default MobileMenu; 