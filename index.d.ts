export type FilePagination = {
  name: string,
  href: string
}

export type DirectoryPagination = {
  dir: string
  nested: Array<FilePagination>
}

export type NestedPagination = Array<DirectoryPagination | FilePagination>

export type UnknownObject = Record<string, any>