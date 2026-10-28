import prisma from '@/core/prisma';
import { EventType, TeamRole } from '@/prisma/client';
import { archiveTeam, createTeam, getTeam, listTeams, updateTeam, updateTeamMembers } from './team';

describe('Team DB service', () => {
  const userId = '507f1f77bcf86cd799439011'; // pragma: allowlist secret
  const createdIds: string[] = [];

  afterAll(async () => {
    await prisma.event.deleteMany({
      where: {
        type: {
          in: [EventType.CREATE_TEAM, EventType.UPDATE_TEAM, EventType.DELETE_TEAM],
        },
        userId,
      },
    });

    await prisma.team.deleteMany({
      where: { id: { in: createdIds } },
    });
  });

  it('creates a team with multiple member roles and records an event', async () => {
    const code = `T${Date.now()}`;

    const team = await createTeam(userId, {
      name: 'Team Model Test',
      code,
      members: [
        {
          userId,
          roles: [TeamRole.PRODUCT_OWNER, TeamRole.TECHNICAL_LEAD],
        },
      ],
    });

    createdIds.push(team.id);

    expect(team.code).toBe(code);
    expect(team.members[0].roles).toEqual([TeamRole.PRODUCT_OWNER, TeamRole.TECHNICAL_LEAD]);

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
      members: [{ userId, roles: [TeamRole.EDITOR] }],
    });
    createdIds.push(team.id);

    const updated = await updateTeam(team.id, userId, {
      name: 'Updated Team',
      code: team.code,
    });

    expect(updated.name).toBe('Updated Team');
    expect(updated.members).toEqual(team.members);

    const retrieved = await getTeam(team.id);
    expect(retrieved?.name).toBe('Updated Team');
  });

  it('updates members separately', async () => {
    const team = await createTeam(userId, {
      name: 'Membership Test',
      code: `M${Date.now()}`,
    });
    createdIds.push(team.id);

    const updated = await updateTeamMembers(team.id, [{ userId, roles: [TeamRole.VIEWER, TeamRole.BILLING_VIEWER] }]);

    expect(updated.members[0].roles).toEqual([TeamRole.VIEWER, TeamRole.BILLING_VIEWER]);
  });

  it('archives teams without deleting them and records a delete event', async () => {
    const team = await createTeam(userId, {
      name: 'Archive Test',
      code: `A${Date.now()}`,
    });
    createdIds.push(team.id);

    const archived = await archiveTeam(team.id, userId);

    expect(archived.archivedAt).not.toBeNull();
    expect(await getTeam(team.id)).not.toBeNull();

    const active = await listTeams();
    expect(active.some((item) => item.id === team.id)).toBe(false);

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
  });
});
