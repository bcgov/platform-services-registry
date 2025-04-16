# Git Branching Model

A Git branching model is a set of conventions that a development team follows when creating and managing branches in a Git repository. It provides a systematic approach to organizing code development, collaboration, and release management.

## GitHub flow

Considering the relatively small size of the project, this project adopts [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow). `GitHub Flow` is a lightweight, branch-based workflow designed around simplicity and continuous delivery. It's often used by teams working with Git and GitHub for version control and collaboration. `GitHub Flow` emphasizes frequent deployments to production and encourages a streamlined approach to development. Here are the key steps in `GitHub Flow`:

1. Create a Branch:
   When starting work on a new feature, improvement, or bug fix, create a new branch. This branch will contain all the changes related to the task.

   - `feat/<ticket#>`
   - `fix/<ticket#>`

2. Add Commits:
   Make small, incremental commits to the branch as you work on the feature or fix. Each commit should represent a logical, standalone change.

3. Open a Pull Request:
   When you're ready to share your work, open a Pull Request (PR) on GitHub. Ensure all CI checks pass to request peer reviews.

4. Discuss and Review:
   Collaborators can review the changes, comment on specific lines of code, and discuss the implementation within the PR.

5. Make Changes (if necessary):
   Based on the feedback received during the review, make any necessary adjustments by adding more commits to the branch.

6. Merge the PR:
   Once the changes are approved and any requested modifications are made, the PR can be merged into the main branch.

7. Deploy to Development:
   After merging to the main branch, the changes are quickly integrated into the live development environment via an automated CD pipeline.

8. Delete the Branch:
   Once the changes are merged, the feature branch can be safely deleted unless there are more changes required to finish the features/fixes.

`GitHub Flow` is often favored for its simplicity and speed. It encourages a continuous delivery approach, where changes are deployed `frequently and in smaller increments`, reducing the risk associated with large, infrequent releases. This workflow is well-suited for teams working on web applications and services where rapid iteration and deployment are crucial.

## Considerations

- Draft Pull Request:

  A `Draft Pull Request` in GitHub is a special type of pull request that indicates that the changes it contains are still a work in progress and not yet ready for review or merging. This feature is useful when you want to share your work with others for visibility or collaboration, but you're not seeking immediate feedback or approval.

  - Please refer to https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests for more detailed information.

- Interactive Rebasing:

  `Interactive rebasing` allows you to have fine-grained control over your commit history, enabling you to clean up, reorder, and squash commits for a cleaner commit history, reducing noise in pull requests.

  For more information, visit:

  - [Git Rebase Documentation](https://git-scm.com/docs/git-rebase)
  - [Git Tools - Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

- Frequent Rebasing:

  `Frequent rebasing` is a vital practice in our workflow, ensuring your feature branch is based on the latest code. This `minimizes conflicts and eases integration`. To rebase, use `git pull origin main --rebase` in your feature branch. This promotes a smoother, collaborative development process.
