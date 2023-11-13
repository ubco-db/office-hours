import { OrganizationModule } from 'organization/organization.module';
import { setupIntegrationTest } from './util/testUtils';
import {
  CourseFactory,
  OrganizationFactory,
  UserFactory,
} from './util/factories';
import { OrganizationUserModel } from 'organization/organization-user.entity';
import { OrganizationCourseModel } from 'organization/organization-course.entity';

describe('Organization Integration', () => {
  const supertest = setupIntegrationTest(OrganizationModule);

  describe('POST /organization/:oid/add_user/:uid', () => {
    it('should return 403 when user is not logged in', async () => {
      const response = await supertest().post('/organization/1/add_member/1');

      expect(response.status).toBe(401);
    });

    it('should return 500 when user does not exist', async () => {
      const user = await UserFactory.create();
      const res = await supertest({ userId: user.id }).post(
        '/organization/1/add_member/0',
      );

      expect(res.status).toBe(500);
    });

    it("should return 200 when user doesn't exist in organization", async () => {
      const user = await UserFactory.create();
      const organization = await OrganizationFactory.create();

      const res = await supertest({ userId: user.id }).post(
        `/organization/${organization.id}/add_member/${user.id}`,
      );

      expect(res.status).toBe(200);
    });

    it('should return 500 when user already exists in organization', async () => {
      const user = await UserFactory.create();
      const organization = await OrganizationFactory.create();

      await OrganizationUserModel.create({
        userId: user.id,
        organizationId: organization.id,
      }).save();

      const res = await supertest({ userId: user.id }).post(
        `/organization/${organization.id}/add_member/${user.id}`,
      );

      expect(res.status).toBe(500);
    });
  });

  describe('GET /organization', () => {
    it('should return 200 and list of organizations', async () => {
      await OrganizationFactory.create();
      await OrganizationFactory.create();

      const res = await supertest().get('/organization').expect(200);

      expect(res.body).toMatchSnapshot();
    });
  });

  describe('POST /organization/:oid/add_course/:cid', () => {
    it('should return 403 when user is not logged in', async () => {
      const response = await supertest().post('/organization/1/add_course/1');

      expect(response.status).toBe(401);
    });

    it('should return 500 when course does not exist', async () => {
      const user = await UserFactory.create();
      const res = await supertest({ userId: user.id }).post(
        '/organization/1/add_course/0',
      );

      expect(res.status).toBe(500);
    });

    it("should return 200 when course doesn't exist in organization", async () => {
      const user = await UserFactory.create();
      const course = await CourseFactory.create();
      const organization = await OrganizationFactory.create();

      const res = await supertest({ userId: user.id }).post(
        `/organization/${organization.id}/add_course/${course.id}`,
      );

      expect(res.status).toBe(200);
    });

    it('should return 500 when course already exists in organization', async () => {
      const user = await UserFactory.create();
      const course = await CourseFactory.create();
      const organization = await OrganizationFactory.create();

      await OrganizationCourseModel.create({
        courseId: course.id,
        organizationId: organization.id,
      }).save();

      const res = await supertest({ userId: user.id }).post(
        `/organization/${organization.id}/add_course/${course.id}`,
      );

      expect(res.status).toBe(500);
    });
  });
});
