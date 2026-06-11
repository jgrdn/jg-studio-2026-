import { Link, type LinkProps } from 'react-router-dom'
import './studio-mark.css'

type BaseProps = {
  className?: string
}

type InternalLinkProps = BaseProps &
  Pick<LinkProps, 'id' | 'onClick' | 'to'> & {
    href?: never
  }

type ExternalLinkProps = BaseProps & {
  href: string
  id?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  to?: never
}

type Props = InternalLinkProps | ExternalLinkProps

/** JG Studio wordmark — matches the main site nav lockup. */
export function StudioMark({ className, id, onClick, ...rest }: Props) {
  const cn = ['studio-mark', className].filter(Boolean).join(' ')

  if ('href' in rest && rest.href) {
    return (
      <a
        className={cn}
        id={id}
        href={rest.href}
        aria-label="JG Studio home"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        JG
      </a>
    )
  }

  return (
    <Link
      className={cn}
      id={id}
      to={rest.to ?? '/'}
      aria-label="JG Studio home"
      onClick={onClick as LinkProps['onClick']}
    >
      JG
    </Link>
  )
}
