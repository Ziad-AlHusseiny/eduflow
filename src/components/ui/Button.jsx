import { Link } from 'react-router-dom';

import { buttonClass } from './buttonClass.js';

/** A button, or a router link when `to` is set, or a plain link when `href` is set. */
export default function Button({ to, href, variant, size, fullWidth, className, icon: IconC, iconEnd: IconEnd, children, ...rest }) {
  const cls = buttonClass({ variant, size, fullWidth, className });
  const inner = (
    <>
      {IconC && <IconC aria-hidden="true" size={size === 'sm' ? 16 : 18} strokeWidth={2} />}
      {children}
      {IconEnd && <IconEnd aria-hidden="true" size={size === 'sm' ? 16 : 18} strokeWidth={2} className="rtl:-scale-x-100" />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button type="button" className={cls} {...rest}>{inner}</button>;
}
