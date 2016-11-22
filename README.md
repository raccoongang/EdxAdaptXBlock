# Edx Adapt XBlock

This XBlock is a tool to configure student automatically in edx-adapt.

Place this XBlock at the beginning of your course so a student gets registered in the edx-adapt instance for a given course before they starts to solve problems.

This XBlock does two things.

1. Lets teacher configure:
    * Edx adapt API base URL
    * Edx adapt parameters for new students
    * Edx adapt skills for new students
2. Register students in the edx adapt app once they view it in the Courseware.

## Teacher configuration fields

- **Component Display Name**: the name student see as a Head for the Unit
- **Params**: parameters for Bayesian Knowledge Tracing (BKT) model default one is:
`{"pi": 0.1, "pt": 0.5, "pg": 0.25, "ps": 0.25, "threshold": 0.99}`
  * *pi* - initial probability student knows the skill
  * *pt* - probability the student learns the skill if they didn’t know it already
  * *pg* - probability the student guesses correctly even if they doesn’t know the skill
  * *ps* - probability student makes a mistake even if they does know the skill
  * *threshold* - value which should be reached to make skill be set as learned

- **skills**: course's skills related to every certain problem, default problems list is `["center", "shape", "spread", "x axis", "y axis", "h to d", "d to h", "histogram", "None"]`
- **Edx Adapt API base URL**: Base URL for Edx Adapt API you're going to work with, e.g. `https://edx-adapt.example.com:443/api/v1`. Ask your Edx Adapt provider for details.

## Student registration flow

1. Check if there's a student in edx adapt with the given anonymous_student_id. If there is, we're done.
2. If there isn't:
    1. Create new user in Edx Adapt system.
    2. Configure for this user each skill defined in **skills** field.

## Edx Adapt logic brief description

When user is registered in edx-adapt each course's skill is setup with default BKT params. During going through the course students answers are taken into account and changed preset parameters depends on correctness of given answers and calculated probability student has already learned skill (Correct Probability).

When skill's Correct Probability achieves threshold value skill set as learned and problem related for that skill is not proposed any more to student.
