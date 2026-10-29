import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { EventType, TeamMemberRole } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import {
  archiveTeams,
  createTeam,
  deleteTeam,
  getTeam,
  listTeamMembers,
  listTeams,
  updateTeam,
  updateTeamMembers,
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

describe('Teams API', () => {
  beforeEach(async () => {
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

    await mockSessionByIdirGuid(mockNoRoleUsers[0].idirGuid);

    const listRes = await listTeams();
    expect(listRes.status).toBe(200);
    expect(await listRes.json()).toHaveLength(1);

    const readRes = await getTeam(team.id);
    expect(readRes.status).toBe(200);

    const createRes = await createTeam({ name: 'Team B', code: 'TEAM-B' });
    expect(createRes.status).toBe(401);

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
    const team = await createTeamAsAdmin('PAYMENTS', [{ userId, roles: [TeamMemberRole.PRODUCT_OWNER] }]);

    expect(team.code).toBe('PAYMENTS');
    expect(team.members).toHaveLength(1);
    expect(team.members[0].user.id).toBe(userId);

    const event = await prisma.event.findFirst({
      where: { type: EventType.CREATE_TEAM },
      orderBy: { createdAt: 'desc' },
    });
    expect(event?.data).toMatchObject({ id: team.id, data: { code: 'PAYMENTS' } });
  });

  it('rejects a duplicate code, an unknown user and a member without roles', async () => {
    await createTeamAsAdmin('PAYMENTS');

    const duplicateRes = await createTeam({ name: 'Other', code: 'PAYMENTS' });
    expect(duplicateRes.status).toBe(400);

    const unknownRes = await createTeam({
      name: 'Other',
      code: 'OTHER',
      members: [{ userId: MISSING_ID, roles: [TeamMemberRole.VIEWER] }],
    });
    expect(unknownRes.status).toBe(400);

    const noRolesRes = await createTeam({
      name: 'Other',
      code: 'OTHER',
      members: [{ userId: await getMockUserId(0), roles: [] }],
    });
    expect(noRolesRes.status).toBe(400);
  });

  it('updates a team and its members', async () => {
    const team = await createTeamAsAdmin('PAYMENTS');
    const userId = await getMockUserId(1);

    const updateRes = await updateTeam(team.id, {
      name: 'Payments Team',
      code: 'PAYMENTS',
      description: 'Handles payments',
    });
    expect(updateRes.status).toBe(200);
    expect((await updateRes.json()).description).toBe('Handles payments');

    const membersRes = await updateTeamMembers(team.id, [
      { userId, roles: [TeamMemberRole.TECHNICAL_LEAD, TeamMemberRole.EDITOR] },
    ]);
    expect(membersRes.status).toBe(200);

    const listMembersRes = await listTeamMembers(team.id);
    const members = await listMembersRes.json();
    expect(members).toHaveLength(1);
    expect(members[0].roles).toEqual([TeamMemberRole.TECHNICAL_LEAD, TeamMemberRole.EDITOR]);
  });

  it('archives teams and hides them from the list by default', async () => {
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
  });

  it('returns 404 for a team that does not exist', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res = await getTeam(MISSING_ID);
    expect(res.status).toBe(404);
  });
});
