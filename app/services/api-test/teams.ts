import { DELETE as _removeTeamMember, PUT as _updateTeamMember } from '@/app/api/teams/[id]/members/[userId]/route';
import { GET as _listTeamMembers, POST as _addTeamMember } from '@/app/api/teams/[id]/members/route';
import { DELETE as _deleteTeam, GET as _getTeam, PUT as _updateTeam } from '@/app/api/teams/[id]/route';
import { POST as _archiveTeams } from '@/app/api/teams/archive/route';
import { GET as _listTeams, POST as _createTeam } from '@/app/api/teams/route';
import { TeamMemberRole } from '@/prisma/client';
import { TeamBody, TeamMemberBody, TeamUpdateBody } from '@/validation-schemas/team';
import { createRoute } from './core';

const teamCollectionRoute = createRoute('/teams');

export async function createTeam(data: Partial<TeamBody>) {
  const result = await teamCollectionRoute.post(_createTeam, '', data);
  return result;
}

export async function listTeams(queryParams?: { includeArchived?: boolean }) {
  const result = await teamCollectionRoute.get(_listTeams, '', { queryParams });
  return result;
}

export async function getTeam(id: string) {
  const result = await teamCollectionRoute.get(_getTeam, '/{{id}}', { pathParams: { id } });
  return result;
}

export async function updateTeam(id: string, data: Partial<TeamUpdateBody>) {
  const result = await teamCollectionRoute.put(_updateTeam, '/{{id}}', data, { pathParams: { id } });
  return result;
}

export async function deleteTeam(id: string) {
  const result = await teamCollectionRoute.delete(_deleteTeam, '/{{id}}', { pathParams: { id } });
  return result;
}

export async function archiveTeams(ids: string[]) {
  const result = await teamCollectionRoute.post(_archiveTeams, '/archive', { ids });
  return result;
}

export async function listTeamMembers(id: string) {
  const result = await teamCollectionRoute.get(_listTeamMembers, '/{{id}}/members', { pathParams: { id } });
  return result;
}

export async function addTeamMember(id: string, data: Partial<TeamMemberBody>) {
  const result = await teamCollectionRoute.post(_addTeamMember, '/{{id}}/members', data, { pathParams: { id } });
  return result;
}

export async function updateTeamMember(id: string, userId: string, roles: TeamMemberRole[]) {
  const result = await teamCollectionRoute.put(
    _updateTeamMember,
    '/{{id}}/members/{{userId}}',
    { roles },
    { pathParams: { id, userId } },
  );
  return result;
}

export async function removeTeamMember(id: string, userId: string) {
  const result = await teamCollectionRoute.delete(_removeTeamMember, '/{{id}}/members/{{userId}}', {
    pathParams: { id, userId },
  });
  return result;
}
