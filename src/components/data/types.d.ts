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
}

interface ItemProps {
  id: UniqueIdentifier;
  orgparent: string;
  parent: string;
  name: string;
  color: string;
  content?: string;
}

interface ItemCollection {
  [key: UniqueIdentifier]: ItemProps[];
}
