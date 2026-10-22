export const getUserRole = (user) => {
  if (!user) return '';

  const values = [];

  const pushValue = (value) => {
    if (value == null) return;

    if (typeof value === 'string') {
      values.push(value.trim());
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }

    if (typeof value === 'boolean') {
      values.push(value ? 'admin' : 'user');
      return;
    }

    if (typeof value === 'object') {
      Object.values(value).forEach(pushValue);
    }
  };

  pushValue(user.role);
  pushValue(user.roles);
  pushValue(user.userRole);
  pushValue(user.accountRole);
  pushValue(user.permission);
  pushValue(user.isAdmin);
  pushValue(user.is_admin);

  const normalized = values
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
    .find((value) => value && value !== 'null' && value !== 'undefined');

  return normalized || '';
};

export const isAdminUser = (user) => {
  const role = getUserRole(user);

  return [
    'admin',
    'super_admin',
    'administrator',
    'administrateur',
    'owner',
    'agency_admin',
    'agence_admin',
    'super-admin'
  ].includes(role);
};
