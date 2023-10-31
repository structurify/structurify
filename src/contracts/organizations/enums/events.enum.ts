export enum OrganizationEvents {
  ORGANIZATION_WILDCARD = 'organization.*',
  ORGANIZATION_CREATED = 'organization.created',
  ORGANIZATION_UPDATED = 'organization.updated',
  ORGANIZATION_DELETED = 'organization.deleted',
  INVITE_WILDCARD = 'invite.*',
  INVITE_CREATED = 'invite.created',
  INVITE_UPDATED = 'invite.updated',
  INVITE_DELETED = 'invite.deleted',
  INVITE_EXPIRED = 'invite.expired',
  INVITE_RESENDED = 'invite.resended',
  MEMBER_WILDCARD = 'member.*',
  MEMBER_CREATED = 'member.created',
  MEMBER_UPDATED = 'member.updated',
  MEMBER_DELETED = 'member.deleted',
}
