// Permission Utility Hook
import { useAuthStore } from '../store';

export const usePermissions = () => {
    const { user } = useAuthStore();

    const permissions = user?.permissions || [];
    const isSuperAdmin = user?.role === 'super_admin';

    const hasPermission = (permission) => {
        if (isSuperAdmin) return true;
        if (!Array.isArray(permissions)) return false;
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        if (isSuperAdmin) return true;
        if (!Array.isArray(permissionList)) return false;
        return permissionList.some(perm => hasPermission(perm));
    };

    const hasAllPermissions = (permissionList) => {
        if (isSuperAdmin) return true;
        if (!Array.isArray(permissionList)) return false;
        return permissionList.every(perm => hasPermission(perm));
    };

    return {
        permissions,
        isSuperAdmin,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
};

export const PermissionGate = ({ permission, children, fallback = null }) => {
    const { hasPermission, isSuperAdmin } = usePermissions();

    if (isSuperAdmin || hasPermission(permission)) {
        return children;
    }

    return fallback;
};
