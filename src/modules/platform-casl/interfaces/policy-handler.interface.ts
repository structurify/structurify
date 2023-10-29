import { AppAbility } from '../factories/ability.factory';

interface IPlatformPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PlatformPolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PlatformPolicyHandler =
  | IPlatformPolicyHandler
  | PlatformPolicyHandlerCallback;
