"""Setup for edxadapt XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='edxadapt-xblock',
    version='0.1',
    description='EdxAdapt XBlock to automatically register students in EdxAdapt system',
    license='AGPL v3',
    packages=[
        'edxadapt',
    ],
    install_requires=[
        'XBlock',
        'xblock-utils',
    ],

    entry_points={
        'xblock.v1': [
            'edxadapt = edxadapt:EdxAdaptXBlock',
        ]
    },
    package_data=package_data("edxadapt", ["static", "public"]),
)
