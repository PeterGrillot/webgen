export type FilePagination = {
  name: string
  href: string
  nav: any
  isNested: boolean
}

export type FullDocument =
  & FilePagination
  & {
    next: FilePagination
    prev: FilePagination
    html: string
    isNested: boolean
  }

export type NestedPagination = Array<string | {
  [x: string]: string[];
}>

export type UnknownObject = Record<string, any>

export { }