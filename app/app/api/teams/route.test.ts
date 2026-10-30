import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { EventType, TeamRole } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import {
  addTeamMember,
  archiveTeams,
  createTeam,
  deleteTeam,
  getTeam,
  listTeamMembers,
  listTeams,
  removeTeamMember,
  updateTeam,
  updateTeamMember,
} from '@/services/api-test/teams';
import { TeamMembers } from '@/validation-schemas/team';

const MISSING_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';

async function getMockUserId(index: number) {
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: mockNoRoleUsers[index].idirGuid } });
  return user.id;
}

async function createTeamAsAdmin(code: string, members: TeamMembers = []) {
  await mockSessionByRole(GlobalRole.Admin);
  const res = await createTeam({ name: `Team ${code}`, code, members });
  expect(res.status).toBe(200);
  return res.json();
}

async function getLatestEvent(type: EventType) {
  return prisma.event.findFirst({ where: { type }, orderBy: { createdAt: 'desc' } });
}

describe('Teams API', () => {
  beforeEach(async () => {
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
  });

  it('rejects requests without a session', async () => {
    await mockSessionByRole();

    const listRes = await listTeams();
    expect(listRes.status).toBe(401);

    const createRes = await createTeam({ name: 'Team A', code: 'TEAM-A' });
    expect(createRes.status).toBe(401);
  });

  it('lets any signed-in user view teams but not manage them', async () => {
    const team = await createTeamAsAdmin('VIEW-ONLY');
    const userId = await getMockUserId(0);

    await mockSessionByIdirGuid(mockNoRoleUsers[0].idirGuid);

    const listRes = await listTeams();
    expect(listRes.status).toBe(200);
    expect(await listRes.json()).toHaveLength(1);

    const readRes = await getTeam(team.id);
    expect(readRes.status).toBe(200);

    const createRes = await createTeam({ name: 'Team B', code: 'TEAM-B' });
    expect(createRes.status).toBe(401);

    const addMemberRes = await addTeamMember(team.id, { userId, roles: [TeamRole.VIEWER] });
    expect(addMemberRes.status).toBe(401);

    const deleteRes = await deleteTeam(team.id);
    expect(deleteRes.status).toBe(401);
  });

  it.each([GlobalRole.Admin, GlobalRole.PrivateAdmin, GlobalRole.PublicAdmin])(
    'lets %s create a team',
    async (role) => {
      await mockSessionByRole(role);

      const res = await createTeam({ name: 'Payments', code: 'PAYMENTS' });
      expect(res.status).toBe(200);
    },
  );

  it('creates a team with members and records an event', async () => {
    const userId = await getMockUserId(0);
    const team = await createTeamAsAdmin('PAYMENTS', [{ userId, roles: [TeamRole.PRODUCT_OWNER] }]);

    expect(team.code).toBe('PAYMENTS');
    expect(team.members).toHaveLength(1);
    expect(team.members[0].user.id).toBe(userId);
    expect(team.members[0].roles).toEqual([TeamRole.PRODUCT_OWNER]);

    const membership = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: team.id, userId } } });
    expect(membership).not.toBeNull();

    const event = await getLatestEvent(EventType.CREATE_TEAM);
    expect(event?.data).toMatchObject({ id: team.id, data: { code: 'PAYMENTS' } });
  });

  it('rejects a duplicate code, an unknown user, a member without roles and a repeated member', async () => {
    await createTeamAsAdmin('PAYMENTS');
    const userId = await getMockUserId(0);

    const duplicateRes = await createTeam({ name: 'Other', code: 'PAYMENTS' });
    expect(duplicateRes.status).toBe(400);

    const unknownRes = await createTeam({
      name: 'Other',
      code: 'OTHER',
      members: [{ userId: MISSING_ID, roles: [TeamRole.VIEWER] }],
    });
    expect(unknownRes.status).toBe(400);

    const noRolesRes = await createTeam({ name: 'Other', code: 'OTHER', members: [{ userId, roles: [] }] });
    expect(noRolesRes.status).toBe(400);

    const repeatedRes = await createTeam({
      name: 'Other',
      code: 'OTHER',
      members: [
        { userId, roles: [TeamRole.VIEWER] },
        { userId, roles: [TeamRole.EDITOR] },
      ],
    });
    expect(repeatedRes.status).toBe(400);
  });

  it('updates the team details and keeps its members', async () => {
    const userId = await getMockUserId(0);
    const team = await createTeamAsAdmin('PAYMENTS', [{ userId, roles: [TeamRole.PRODUCT_OWNER] }]);

    const updateRes = await updateTeam(team.id, {
      name: 'Payments Team',
      code: 'PAYMENTS',
      description: 'Handles payments',
    });
    expect(updateRes.status).toBe(200);

    const updated = await updateRes.json();
    expect(updated.name).toBe('Payments Team');
    expect(updated.description).toBe('Handles payments');
    expect(updated.members).toHaveLength(1);
    expect(updated.members[0].userId).toBe(userId);
  });

  it('adds, updates and removes one member at a time, with an event for each', async () => {
    const team = await createTeamAsAdmin('PAYMENTS');
    const userId = await getMockUserId(1);

    const addMemberRes = await addTeamMember(team.id, { userId, roles: [TeamRole.TECHNICAL_LEAD] });
    expect(addMemberRes.status).toBe(200);
    expect((await addMemberRes.json()).user.id).toBe(userId);
    expect((await getLatestEvent(EventType.CREATE_TEAM_MEMBER))?.data).toMatchObject({
      id: team.id,
      data: { userId, roles: [TeamRole.TECHNICAL_LEAD] },
    });

    const updateRes = await updateTeamMember(team.id, userId, [TeamRole.TECHNICAL_LEAD, TeamRole.EDITOR]);
    expect(updateRes.status).toBe(200);
    expect((await getLatestEvent(EventType.UPDATE_TEAM_MEMBER))?.data).toMatchObject({ id: team.id });

    const listRes = await listTeamMembers(team.id);
    const members = await listRes.json();
    expect(members).toHaveLength(1);
    expect(members[0].roles).toEqual([TeamRole.TECHNICAL_LEAD, TeamRole.EDITOR]);

    const removeRes = await removeTeamMember(team.id, userId);
    expect(removeRes.status).toBe(200);
    expect((await getLatestEvent(EventType.DELETE_TEAM_MEMBER))?.data).toMatchObject({ id: team.id });

    const emptyRes = await listTeamMembers(team.id);
    expect(await emptyRes.json()).toHaveLength(0);
  });

  it('rejects adding an existing member or an unknown user, and changing someone who is not a member', async () => {
    const userId = await getMockUserId(0);
    const otherUserId = await getMockUserId(1);
    const team = await createTeamAsAdmin('PAYMENTS', [{ userId, roles: [TeamRole.PRODUCT_OWNER] }]);

    const existingRes = await addTeamMember(team.id, { userId, roles: [TeamRole.VIEWER] });
    expect(existingRes.status).toBe(400);

    const unknownRes = await addTeamMember(team.id, { userId: MISSING_ID, roles: [TeamRole.VIEWER] });
    expect(unknownRes.status).toBe(400);

    const updateRes = await updateTeamMember(team.id, otherUserId, [TeamRole.VIEWER]);
    expect(updateRes.status).toBe(404);

    const removeRes = await removeTeamMember(team.id, otherUserId);
    expect(removeRes.status).toBe(404);
  });

  it('lets a user belong to several teams', async () => {
    const userId = await getMockUserId(0);
    await createTeamAsAdmin('TEAM-A', [{ userId, roles: [TeamRole.EDITOR] }]);
    await createTeamAsAdmin('TEAM-B', [{ userId, roles: [TeamRole.VIEWER] }]);

    const memberships = await prisma.teamMember.findMany({ where: { userId }, include: { team: true } });
    expect(memberships.map((membership) => membership.team.code).sort()).toEqual(['TEAM-A', 'TEAM-B']);
  });

  it('archives teams, hides them from the list by default and blocks changes to them', async () => {
    const userId = await getMockUserId(0);
    const teamA = await createTeamAsAdmin('TEAM-A');
    const teamB = await createTeamAsAdmin('TEAM-B');
    const teamC = await createTeamAsAdmin('TEAM-C');

    const deleteRes = await deleteTeam(teamA.id);
    expect(deleteRes.status).toBe(200);

    const archiveRes = await archiveTeams([teamB.id]);
    expect(archiveRes.status).toBe(200);

    const listRes = await listTeams();
    expect((await listRes.json()).map((team: { id: string }) => team.id)).toEqual([teamC.id]);

    const allRes = await listTeams({ includeArchived: true });
    expect(await allRes.json()).toHaveLength(3);

    const updateArchivedRes = await updateTeam(teamA.id, { name: 'Team A', code: 'TEAM-A' });
    expect(updateArchivedRes.status).toBe(400);

    const addMemberArchivedRes = await addTeamMember(teamA.id, { userId, roles: [TeamRole.VIEWER] });
    expect(addMemberArchivedRes.status).toBe(400);
  });

  it('returns 404 for a team that does not exist', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res = await getTeam(MISSING_ID);
    expect(res.status).toBe(404);

    const membersRes = await listTeamMembers(MISSING_ID);
    expect(membersRes.status).toBe(404);
  });
});
