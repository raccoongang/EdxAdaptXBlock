import logging
import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Boolean, Dict, Float, String
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin


_ = lambda text: text
log = logging.getLogger(__name__)


class EdxAdaptXBlock(StudioEditableXBlockMixin, XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    has_author_view = True

    display_name = String(
        default='Adaptive Learning',
        display_name=_('Component Display Name'),
        help=_('The name students see. This name appears in the course ribbon and as a header for the video.'),
        scope=Scope.content,
    )

    params = Dict(
        default={'pg': 0.25, 'ps': 0.25, 'pi': 0.1, 'pt': 0.5, 'threshold': 0.99},
        scope=Scope.content)

    edx_adapt_api_url = String(
        default='',
        scope=Scope.content,
        help="Edx Adapt API base URL, e.g. https://edx-adapt.example.com:443/api/v1")
    student_is_registered = Boolean(
        default=False,
        scope=Scope.preferences
    )

    editable_fields = ('display_name', 'params', 'edx_adapt_api_url')

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        Configures user in edx-adapt if it wasn't configured before
        """
        # html = self.resource_string("static/html/edxadapt.html")
        # frag = Fragment(html.format(self=self))
        # frag.add_css(self.resource_string("static/css/edxadapt.css"))
        # frag.add_javascript(self.resource_string("static/js/src/edxadapt.js"))
        # frag.initialize_js('EdxAdaptXBlock')

        html = u"<div>I'm a student view. Anonymous student id == {}</div>".format(self.xmodule_runtime.anonymous_student_id)
        frag = Fragment(html)
        return frag

    def author_view(self, context=None):
        html = self.resource_string('static/html/author_view.html').format(
            edx_adapt_api_url=self.edx_adapt_api_url,
            params=self.params
        )
        frag = Fragment(html)
        return frag
