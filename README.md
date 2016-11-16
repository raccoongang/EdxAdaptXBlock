# Edx Adapt XBlock

This XBlock is a tool to help configure student correctly in edx-adapt automatically (instead of manually setup students via python user_setup_test.py <user>)

Place this XBlock at the beginning of your course so a student gets registered in the edx-adapt instance for a given course before she starts to solve problems.

This XBlock does two things.

1. Lets teacher configure:
    * Edx adapt API base URL
    * Edx adapt parameters for new students
1. Registers students in the edx adapt app once they view it in the Courseware.
