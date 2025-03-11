import Link from 'next/link'
import Image, { ImageProps } from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import { MDXRemoteProps } from 'next-mdx-remote'

type CustomMDXProps = {
  source: string;
  components?: typeof components;
} & MDXRemoteProps;

type TableProps = {
  data: {
    headers: string[]
    rows: string[][]
  }
}

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

function Table({ data }: TableProps) {
  let headers = data.headers.map((header, index) => <th key={index}>{header}</th>)
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props: CustomLinkProps) {
  let { href, ...rest } = props

  if (href.startsWith('/')) {
    return <Link href={href} {...rest}>{props.children}</Link>
  }

  if (href.startsWith('#')) {
    return <a {...rest} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...rest} />
}

function RoundedImage(props: ImageProps) {
  return <Image className="rounded-lg" {...props} />
}

function Code({ children, ...props }: { children: string } & React.ComponentProps<'code'>) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({ children } : {children: string}) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      // @ts-expect-error components prop is not in the MDXRemoteProps type
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
