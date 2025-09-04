"""
ODIADEV TTS Python SDK Setup
Professional Text-to-Speech SDK for Nigerian and US English Voices
"""

from setuptools import setup, find_packages
import os

# Read README file
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "Professional Text-to-Speech SDK for Nigerian and US English Voices"

# Read requirements
def read_requirements():
    requirements_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_path):
        with open(requirements_path, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip() and not line.startswith('#')]
    return ['requests>=2.25.0']

setup(
    name="odiadev-tts",
    version="1.0.0",
    author="ODIADEV",
    author_email="support@odia.dev",
    description="Professional Text-to-Speech SDK for Nigerian and US English Voices",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://tts-api.odia.dev",
    project_urls={
        "Bug Reports": "https://github.com/odiadev/odiadev-tts-sdk/issues",
        "Source": "https://github.com/odiadev/odiadev-tts-sdk",
        "Documentation": "https://docs.odia.dev/tts",
    },
    packages=find_packages(),
    py_modules=["odiadev_tts"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Multimedia :: Sound/Audio :: Speech",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.7",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=21.0",
            "flake8>=3.8",
            "mypy>=0.800",
        ],
        "docs": [
            "sphinx>=4.0",
            "sphinx-rtd-theme>=1.0",
        ],
    },
    keywords=[
        "tts",
        "text-to-speech",
        "nigerian",
        "voice",
        "ai",
        "speech",
        "audio",
        "openai",
        "compatible",
        "elevenlabs",
        "alternative",
    ],
    entry_points={
        "console_scripts": [
            "odiadev-tts=odiadev_tts.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
