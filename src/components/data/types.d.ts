interface OrganizationComponentProps {
  organization: OrganizationProps;
}

interface OrganizationProps {
  id?: string;
  name: string;
  icon: string;
  color: string;
  accent: string;
}

interface CollectionProps {
  id: UniqueIdentifier;
  parent: string;
  name: string;
  color: string;
  order: string;
  minimized: boolean;
}

interface ItemProps {
  id: UniqueIdentifier;
  orgparent: string;
  parent: string;
  name: string;
  color: string;
  type: string;
  content?: string;
  link?: string;
  icon?: string;
  order: string;
  isShared: boolean;
}

interface ItemCollection {
  [key: UniqueIdentifier]: ItemProps[];
}

interface SortableItemProps {
  name: UniqueIdentifier;
  id?: number;
  data: ItemProps;
  currentlyContainer?: boolean;
}
