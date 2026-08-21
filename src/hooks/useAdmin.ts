import { useState, useEffect, useCallback } from 'react';

// Simple SHA-256 hash using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode('linkhub_salt_' + password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function useAdmin() {
  const [hasPassword, setHasPassword] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('linkhub_admin_pwd_hash'));
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('linkhub_admin_session') === 'true';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'unlock' | 'setup' | 'change'>('unlock');

  useEffect(() => {
    const savedHash = localStorage.getItem('linkhub_admin_pwd_hash');
    setHasPassword(Boolean(savedHash));
  }, []);

  const openAdminModal = useCallback(() => {
    const savedHash = localStorage.getItem('linkhub_admin_pwd_hash');
    if (!savedHash) {
      setModalMode('setup');
    } else if (isAdmin) {
      setModalMode('change');
    } else {
      setModalMode('unlock');
    }
    setIsModalOpen(true);
  }, [isAdmin]);

  const closeAdminModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    const savedHash = localStorage.getItem('linkhub_admin_pwd_hash');
    if (!savedHash) {
      const newHash = await hashPassword(password);
      localStorage.setItem('linkhub_admin_pwd_hash', newHash);
      setHasPassword(true);
      setIsAdmin(true);
      sessionStorage.setItem('linkhub_admin_session', 'true');
      setIsModalOpen(false);
      return true;
    }

    const inputHash = await hashPassword(password);
    if (inputHash === savedHash) {
      setIsAdmin(true);
      sessionStorage.setItem('linkhub_admin_session', 'true');
      setIsModalOpen(false);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem('linkhub_admin_session');
  }, []);

  const setMasterPassword = useCallback(async (newPassword: string) => {
    const newHash = await hashPassword(newPassword);
    localStorage.setItem('linkhub_admin_pwd_hash', newHash);
    setHasPassword(true);
    setIsAdmin(true);
    sessionStorage.setItem('linkhub_admin_session', 'true');
    setIsModalOpen(false);
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const savedHash = localStorage.getItem('linkhub_admin_pwd_hash');
    if (savedHash) {
      const oldHash = await hashPassword(oldPassword);
      if (oldHash !== savedHash) {
        return false;
      }
    }
    const newHash = await hashPassword(newPassword);
    localStorage.setItem('linkhub_admin_pwd_hash', newHash);
    setHasPassword(true);
    setIsModalOpen(false);
    return true;
  }, []);

  const resetPassword = useCallback(() => {
    localStorage.removeItem('linkhub_admin_pwd_hash');
    sessionStorage.removeItem('linkhub_admin_session');
    setHasPassword(false);
    setIsAdmin(false);
    setIsModalOpen(false);
  }, []);

  return {
    isAdmin,
    hasPassword,
    isModalOpen,
    modalMode,
    openAdminModal,
    closeAdminModal,
    unlock,
    lock,
    setMasterPassword,
    changePassword,
    resetPassword,
  };
}
