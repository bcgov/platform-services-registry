import prisma from '@/core/prisma';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { EventType, TeamRole } from '@/prisma/client';
import {
  addTeamMember,
  archiveTeam,
  createTeam,
  getTeam,
  getTeamDetail,
  getTeamMember,
  listTeams,
  removeTeamMember,
  updateTeam,
  updateTeamMemberRoles,
} from './team';

describe('Team DB service', () => {
  const userId = '507f1f77bcf86cd799439011'; // pragma: allowlist secret
  let memberUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: mockNoRoleUsers[0].idirGuid } });
    memberUserId = user.id;
  });

  beforeEach(async () => {
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
  });

  afterAll(async () => {
    await prisma.event.deleteMany({
      where: {
        type: {
          in: [
            EventType.CREATE_TEAM,
            EventType.UPDATE_TEAM,
            EventType.DELETE_TEAM,
            EventType.CREATE_TEAM_MEMBER,
            EventType.UPDATE_TEAM_MEMBER,
            EventType.DELETE_TEAM_MEMBER,
          ],
        },
        userId,
      },
    });
  });

  it('creates a team with multiple member roles and records an event', async () => {
    const code = `T${Date.now()}`;

    const team = await createTeam(userId, {
      name: 'Team Model Test',
      code,
      members: [
        {
          userId: memberUserId,
          roles: [TeamRole.PRODUCT_OWNER, TeamRole.TECHNICAL_LEAD],
        },
      ],
    });

    expect(team.code).toBe(code);

    const member = await getTeamMember(team.id, memberUserId);
    expect(member?.roles).toEqual([TeamRole.PRODUCT_OWNER, TeamRole.TECHNICAL_LEAD]);

    const event = await prisma.event.findFirst({
      where: {
        type: EventType.CREATE_TEAM,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(event).not.toBeNull();
    expect(event?.data).toMatchObject({
      id: team.id,
      data: { name: team.name, code: team.code },
    });
  });

  it('updates team details without changing members', async () => {
    const team = await createTeam(userId, {
      name: 'Original Team',
      code: `U${Date.now()}`,
      members: [{ userId: memberUserId, roles: [TeamRole.EDITOR] }],
    });

    const updated = await updateTeam(team.id, userId, {
      name: 'Updated Team',
      code: team.code,
    });

    expect(updated?.name).toBe('Updated Team');

    const retrieved = await getTeamDetail(team.id);
    expect(retrieved?.name).toBe('Updated Team');
    expect(retrieved?.members).toHaveLength(1);
  });

  it('adds, updates and removes members one at a time', async () => {
    const team = await createTeam(userId, {
      name: 'Membership Test',
      code: `M${Date.now()}`,
    });

    const added = await addTeamMember(team.id, userId, { userId: memberUserId, roles: [TeamRole.VIEWER] });
    expect(added?.roles).toEqual([TeamRole.VIEWER]);

    const updated = await updateTeamMemberRoles(team.id, userId, added!.id, [TeamRole.VIEWER, TeamRole.BILLING_VIEWER]);
    expect(updated?.roles).toEqual([TeamRole.VIEWER, TeamRole.BILLING_VIEWER]);

    const removed = await removeTeamMember(team.id, userId, added!.id);
    expect(removed?.userId).toBe(memberUserId);
    expect(await getTeamMember(team.id, memberUserId)).toBeNull();
  });

  it('archives teams without deleting them, records a delete event and blocks further changes', async () => {
    const team = await createTeam(userId, {
      name: 'Archive Test',
      code: `A${Date.now()}`,
    });

    const archived = await archiveTeam(team.id, userId);

    expect(archived.archivedAt).not.toBeNull();
    expect(await getTeam(team.id)).not.toBeNull();

    const active = await listTeams();
    expect(active.some((item) => item.id === team.id)).toBe(false);

    const all = await listTeams({ includeArchived: true });
    expect(all.some((item) => item.id === team.id)).toBe(true);

    const event = await prisma.event.findFirst({
      where: {
        type: EventType.DELETE_TEAM,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(event?.data).toMatchObject({
      id: team.id,
    });

    expect(await updateTeam(team.id, userId, { name: 'Changed', code: team.code })).toBeNull();
    expect(await addTeamMember(team.id, userId, { userId: memberUserId, roles: [TeamRole.VIEWER] })).toBeNull();
  });
});
