/**
 * Maps block / project-type ids to [Primer Octicons](https://primer.style/octicons/).
 */
import {
  AccessibilityIcon,
  BeakerIcon,
  BookIcon,
  BrowserIcon,
  CodeSquareIcon,
  CreditCardIcon,
  DatabaseIcon,
  DeviceMobileIcon,
  FileDirectoryIcon,
  FileIcon,
  GearIcon,
  GlobeIcon,
  GraphIcon,
  KeyIcon,
  LawIcon,
  LinkIcon,
  MailIcon,
  OrganizationIcon,
  PaintbrushIcon,
  PlugIcon,
  RocketIcon,
  SearchIcon,
  ServerIcon,
  ShieldIcon,
  ShieldLockIcon,
  StackIcon,
  SyncIcon,
  WorkflowIcon,
  ZapIcon,
} from '@primer/octicons-react';
import type { FC } from 'react';

type OcticonComponent = FC<{ size?: number | 'small' | 'medium' | 'large'; className?: string }>;

const BLOCK_ICONS: Record<string, OcticonComponent> = {
  'visual-ui': PaintbrushIcon,
  'markup-structure': CodeSquareIcon,
  accessibility: AccessibilityIcon,
  functionality: GearIcon,
  routing: LinkIcon,
  'state-management': WorkflowIcon,
  'backend-api': ServerIcon,
  database: DatabaseIcon,
  auth: ShieldLockIcon,
  security: ShieldIcon,
  'file-storage': FileDirectoryIcon,
  payments: CreditCardIcon,
  'email-notifications': MailIcon,
  'env-secrets': KeyIcon,
  hosting: RocketIcon,
  'ci-cd': SyncIcon,
  analytics: GraphIcon,
  'seo-performance': SearchIcon,
  testing: BeakerIcon,
  documentation: BookIcon,
  compliance: LawIcon,
};

const PROJECT_TYPE_ICONS: Record<string, OcticonComponent> = {
  markdown: FileIcon,
  'mood-board': PaintbrushIcon,
  'plugin-extension': PlugIcon,
  prototype: ZapIcon,
  website: GlobeIcon,
  'web-app': BrowserIcon,
  saas: OrganizationIcon,
  'ios-mac-app': DeviceMobileIcon,
  platform: StackIcon,
};

export function BlockOcticon({
  blockId,
  size = 16,
  className,
}: {
  blockId: string;
  size?: number;
  className?: string;
}) {
  const Cmp = BLOCK_ICONS[blockId] ?? StackIcon;
  return <Cmp size={size} className={className} aria-hidden />;
}

export function ProjectTypeOcticon({
  typeId,
  size = 24,
  className,
}: {
  typeId: string;
  size?: number;
  className?: string;
}) {
  const Cmp = PROJECT_TYPE_ICONS[typeId] ?? StackIcon;
  return <Cmp size={size} className={className} aria-hidden />;
}
