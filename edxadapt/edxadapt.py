import json
import logging
import pkg_resources

from HTMLParser import HTMLParser
from xblock.core import XBlock
from xblock.fields import Scope, Boolean, Dict, List, String
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin

from student.models import anonymous_id_for_user


_ = lambda text: text
log = logging.getLogger(__name__)
html_parser = HTMLParser()


class EdxAdaptXBlock(StudioEditableXBlockMixin, XBlock):
    """
    This XBlock automatically registers students in the EdxAdapt instance
    using parameters configured by the teaching staff: params, skills, edx_adapt_api_url
    """

    has_author_view = True

    display_name = String(
        default=_('Adaptive Learning Enrollment'),
        display_name=_('Display name'),
        scope=Scope.settings,
        help=_('XBlock displayed name in the unit content'),
    )

    params = Dict(
        default={'pg': 0.25, 'ps': 0.25, 'pi': 0.1, 'pt': 0.5, 'threshold': 0.99},
        display_name=_('BKT params'),
        help=_('Parameters for Bayesian Knowledge Tracing (BKT) model'),
        scope=Scope.settings,
    )

    skills = List(
        default=[
            'center', 'shape', 'spread', 'x axis', 'y axis', 'h to d',
            'd to h', 'histogram', 'None'
        ],
        display_name=_('Course skills list'),
        scope=Scope.settings,
        help=_(
            'List of skills of this course. Each problem addresses certain skill. '
            'Special skill "None" is used for those problems which belong to none.'
        ),
    )
    edx_adapt_api_url = String(
        default='',
        display_name=_('Edx Adapt API base URL'),
        scope=Scope.settings,
        help=_('Edx Adapt API base URL, e.g. https://edx-adapt.example.com:443/api/v1'),
    )

    edx_adapt_course_id = String(
        default='',
        display_name=_('Edx Adapt Course ID'),
        scope=Scope.settings,
        help=_(
            "ID of a course configured on Edx Adapt side. "
            "By default Course ID is taken from the Edx and follows scheme: <University+Course_name+course_run>. E.g. "
            "Stanford+PS01+2017. If course contains more than one section with adaptive problems and XBlock is "
            "included in each section, Course ID must be set manually and include name of a section with adaptive problems. "
            "It then must follow scheme: <University+Course_name+course_run:section_name>. E.g. Stanford+PS01+2017:introduction"
        ),
    )

    success_registration_msg = String(
        default=_(
            "Your adaptive learning session is configured now. Please click Next button to start solve problems."
        ),
        display_name=_("Successful EdxAdapt registration message"),
        help=_("Message displayed to student after successful registration in EdxAdapt."),
        scope=Scope.settings,
    )

    fail_registration_msg = String(
        default=_(
            "There was a technical issue while we were configuring your adaptive learning session. Please try to "
            "refresh this page or contact technical staff if problem persists."
        ),
        display_name=_("Failed EdxAdapt registration message"),
        help=_("Assistance message with steps student can do to improve Edx Adapt enrollment, e.g. email could be "
               "added for asking for technical support."),
        scope=Scope.settings,
    )

    editable_fields = (
        'params',
        'skills',
        'edx_adapt_api_url',
        'success_registration_msg',
        'fail_registration_msg',
        'edx_adapt_course_id',
    )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def ugettext(self, text):
        """
        For backward compatibility with older version of XBlock module released before Mar 22, 2016

        See https://github.com/edx/XBlock/blame/ab636a82bc23c3f65a618e438637d518b209790f/xblock/core.py#L204
        """
        return text

    def get_anonymous_student_id(self):
        """
        Returns course non-specific anonymous student id compatible with
        anonymous id used by Capa Problems.
        """
        user = self.system.get_real_user(self.system.anonymous_student_id)
        return anonymous_id_for_user(user, None, save=False)

    def get_course_id(self):
        """
        Returns short course id compatible with course ids used by
        Open edX <=> edx adapt communication javascript.
        """
        # NOTE(idegtiarov) drop meaningless part of default course_id to decrease length of id which is stored in
        # the database
        return self.course_id.course.replace('course-v1:', '')

    def student_view(self, context=None):
        """
        Configures user in edx-adapt if it wasn't configured before
        """
        html = self.resource_string("static/html/student_view.html")
        anonymous_student_id = self.get_anonymous_student_id()
        course_id = self.edx_adapt_course_id if self.edx_adapt_course_id else self.get_course_id()
        frag = Fragment(html.format(
            anonymous_student_id=anonymous_student_id,
            course_id=course_id,
            edx_adapt_api_url=self.edx_adapt_api_url.rstrip('/'),
            params=json.dumps(self.params),
            skills=json.dumps(self.skills),
            success_registration_msg=self.success_registration_msg,
            fail_registration_msg=self.fail_registration_msg,
        ))
        frag.add_css(self.resource_string("static/css/edxadapt.css"))
        frag.add_javascript(self.resource_string('static/js/src/edxadapt.js'))
        frag.initialize_js('EdxAdaptXBlock')

        return frag

    def author_view(self, context=None):
        """
        Separate view for Open edX Studio.
        It displays current xblock settings instead of trying
        to register user in the EdxAdapt
        """
        html = self.resource_string('static/html/author_view.html').format(
            edx_adapt_api_url=self.edx_adapt_api_url,
            params=self.params,
            skills=self.skills,
        )
        frag = Fragment(html)
        return frag
