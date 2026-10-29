import { GET as _listTeamMembers, PUT as _updateTeamMembers } from '@/app/api/teams/[id]/members/route';
import { DELETE as _deleteTeam, GET as _getTeam, PUT as _updateTeam } from '@/app/api/teams/[id]/route';
import { POST as _archiveTeams } from '@/app/api/teams/archive/route';
import { GET as _listTeams, POST as _createTeam } from '@/app/api/teams/route';
import { TeamBody, TeamMembers } from '@/validation-schemas/team';
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

export async function updateTeam(id: string, data: Partial<TeamBody>) {
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

export async function updateTeamMembers(id: string, members: TeamMembers) {
  const result = await teamCollectionRoute.put(
    _updateTeamMembers,
    '/{{id}}/members',
    { members },
    { pathParams: { id } },
  );
  return result;
}
