import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './CreateCodingQuestion.css';

const CreateCodingQuestion = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id } = useParams(); // For editing existing question
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  
  const [questionData, setQuestionData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    category: 'Programming',
    tags: [],
    supportedLanguages: ['python'],
    starterCode: {
      c: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      python: '# Write your code here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()',
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}'
    },
    solutionCode: {
      c: '',
      cpp: '',
      python: '',
      java: ''
    },
    testCases: [
      { input: '', expectedOutput: '', points: 1, isHidden: false, description: 'Test case 1' }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 256,
      inputFormat: '',
      outputFormat: ''
    },
    notifyStudents: false
  });

  const [examData, setExamData] = useState({
    enabled: false,
    title: '',
    description: '',
    course: '',
    courseCode: '',
    duration: 60,
    startDate: '',
    endDate: '',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchQuestion(id);
    }
  }, [id]);

  const fetchQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/coding-questions/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestionData(data.data || data);
        toast.success('Question loaded successfully');
      } else {
        toast.error('Failed to load question');
        navigate('/admin/coding-questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Error loading question');
      navigate('/admin/coding-questions');
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setQuestionData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { 
        input: '', 
        expectedOutput: '', 
        points: 1, 
        isHidden: false, 
        description: `Test case ${prev.testCases.length + 1}` 
      }]
    }));
  };

  const removeTestCase = (index) => {
    setQuestionData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const updateTestCase = (index, field, value) => {
    setQuestionData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !questionData.tags.includes(tagInput.trim())) {
      setQuestionData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setQuestionData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleLanguage = (language) => {
    setQuestionData(prev => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(language)
        ? prev.supportedLanguages.filter(lang => lang !== language)
        : [...prev.supportedLanguages, language]
    }));
  };

  const validateForm = () => {
    if (!questionData.title.trim()) {
      toast.error('Question title is required');
      setActiveTab('basic');
      return false;
    }

    if (!questionData.description.trim()) {
      toast.error('Question description is required');
      setActiveTab('basic');
      return false;
    }

    if (questionData.testCases.length === 0) {
      toast.error('At least one test case is required');
      setActiveTab('test');
      return false;
    }

    const hasValidTestCase = questionData.testCases.some(tc => 
      tc.input.trim() && tc.expectedOutput.trim()
    );

    if (!hasValidTestCase) {
      toast.error('At least one test case must have input and expected output');
      setActiveTab('test');
      return false;
    }

    return true;
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) return;

    setLoading(true);
    const loadingToast = toast.loading('Creating coding question...');

    try {
      const payload = {
        title: questionData.title.trim(),
        description: questionData.description.trim(),
        difficulty: questionData.difficulty,
        category: questionData.category,
        tags: questionData.tags,
        supportedLanguages: questionData.supportedLanguages,
        starterCode: questionData.starterCode,
        solutionCode: questionData.solutionCode,
        testCases: questionData.testCases.map(tc => ({
          input: tc.input.toString(),
          expectedOutput: tc.expectedOutput.toString(),
          points: Number.isFinite(tc.points) ? tc.points : 1,
          isHidden: !!tc.isHidden,
          description: tc.description || ''
        })),
        constraints: {
          timeLimit: Number.isFinite(questionData.constraints.timeLimit) ? questionData.constraints.timeLimit : 2000,
          memoryLimit: Number.isFinite(questionData.constraints.memoryLimit) ? questionData.constraints.memoryLimit : 256,
          inputFormat: questionData.constraints.inputFormat || '',
          outputFormat: questionData.constraints.outputFormat || ''
        },
        notifyStudents: !!questionData.notifyStudents
      };

      const url = isEditing ? `/api/v1/coding-questions/${id}` : '/api/v1/coding-questions';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        toast.success(`🎉 Coding question ${isEditing ? 'updated' : 'created'} successfully!`);
        
        // Handle exam creation if enabled
        if (examData.enabled && !isEditing) {
          await handleCreateExam(data.data?._id || data._id);
        }

        navigate('/admin/coding-questions');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`❌ ${errorData.message || 'Failed to save coding question'}`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error saving question:', error);
      toast.error('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (questionId) => {
    try {
      if (!examData.title.trim()) {
        toast.error('Exam title is required');
        return;
      }
      if (!examData.course.trim() || !examData.courseCode.trim()) {
        toast.error('Course and Course Code are required');
        return;
      }
      if (!examData.startDate || !examData.endDate) {
        toast.error('Start and end date/time are required');
        return;
      }

      const startIso = new Date(examData.startDate).toISOString();
      const endIso = new Date(examData.endDate).toISOString();

      if (new Date(startIso) >= new Date(endIso)) {
        toast.error('End time must be after start time');
        return;
      }

      const examPayload = {
        title: examData.title.trim(),
        description: examData.description?.trim() || '',
        codingQuestionId: questionId,
        course: examData.course.trim(),
        courseCode: examData.courseCode.trim(),
        settings: { duration: parseInt(examData.duration, 10) },
        scheduling: {
          startDate: startIso,
          endDate: endIso,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        }
      };

      const examResponse = await fetch('/api/v1/coding-exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(examPayload)
      });

      if (examResponse.ok) {
        const examResult = await examResponse.json();
        toast.success('📅 Coding exam scheduled successfully!');
        
        // Try to publish the exam
        try {
          const publishResponse = await fetch(`/api/v1/coding-exams/${examResult.data._id}/publish`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          
          if (publishResponse.ok) {
            toast.success('📢 Exam published successfully!');
          }
        } catch (publishError) {
          console.error('Failed to publish exam:', publishError);
        }
      } else {
        const examError = await examResponse.json().catch(() => ({}));
        toast.error(`❌ ${examError.message || 'Failed to schedule coding exam'}`);
      }
    } catch (examError) {
      console.error('Error creating coding exam:', examError);
      toast.error('❌ Error creating coding exam');
    }
  };

  const runTestCase = async (testCaseIndex) => {
    const testCase = questionData.testCases[testCaseIndex];
    const selectedLanguage = questionData.supportedLanguages[0] || 'python';
    
    try {
      const response = await fetch('/api/v1/coding-questions/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: questionData.solutionCode[selectedLanguage],
          language: selectedLanguage,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Test case ${testCaseIndex + 1} passed!`);
      } else {
        toast.error(`❌ Test case ${testCaseIndex + 1} failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error running test case');
      console.error('Test case error:', error);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="create-coding-question">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Loading Question...</h2>
          <p>Fetching question details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-coding-question">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin/coding-questions')}
            >
              ← Back to Questions
            </button>
            <h1>{isEditing ? '✏️ Edit Coding Question' : '🚀 Create Coding Question'}</h1>
            <p>Design professional programming challenges with comprehensive test cases</p>
          </div>
          <div className="header-actions">
            <button 
              className="preview-btn"
              onClick={() => setShowPreview(!showPreview)}
            >
              <span className="btn-icon">👁️</span>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              📝 Basic Info
            </button>
            <button 
              className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              💻 Code Templates
            </button>
            <button 
              className={`tab-btn ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              🧪 Test Cases
            </button>
            <button 
              className={`tab-btn ${activeTab === 'constraints' ? 'active' : ''}`}
              onClick={() => setActiveTab('constraints')}
            >
              ⚙️ Constraints
            </button>
            <button 
              className={`tab-btn ${activeTab === 'exam' ? 'active' : ''}`}
              onClick={() => setActiveTab('exam')}
            >
              📅 Create Exam
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <div className="form-section">
                  <div className="form-group">
                    <label>Question Title *</label>
                    <input
                      type="text"
                      value={questionData.title}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Two Sum Problem"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Difficulty *</label>
                      <select
                        value={questionData.difficulty}
                        onChange={(e) => setQuestionData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="form-select"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={questionData.category}
                        onChange={(e) => setQuestionData(prev => ({ ...prev, category: e.target.value }))}
                        className="form-select"
                      >
                        <option value="Programming">Programming</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Algorithms">Algorithms</option>
                        <option value="Database">Database</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Problem Description *</label>
                    <textarea
                      value={questionData.description}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the problem statement clearly..."
                      className="form-textarea"
                      rows="8"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags</label>
                    <div className="tag-input-container">
                      <div className="tags-list">
                        {questionData.tags.map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                            <button 
                              className="tag-remove"
                              onClick={() => removeTag(tag)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="tag-input-wrapper">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add tags..."
                          className="tag-input"
                        />
                        <button 
                          className="tag-add-btn"
                          onClick={addTag}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Supported Languages</label>
                    <div className="language-checkboxes">
                      {['python', 'java', 'cpp', 'c'].map(lang => (
                        <label key={lang} className="language-checkbox">
                          <input
                            type="checkbox"
                            checked={questionData.supportedLanguages.includes(lang)}
                            onChange={() => toggleLanguage(lang)}
                          />
                          <span className="language-name">{lang.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={questionData.notifyStudents}
                        onChange={(e) => setQuestionData(prev => ({ ...prev, notifyStudents: e.target.checked }))}
                      />
                      Notify students when question is created
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Code Templates Tab */}
            {activeTab === 'code' && (
              <div className="tab-panel">
                <div className="code-templates-section">
                  <div className="language-tabs">
                    {questionData.supportedLanguages.map(lang => (
                      <button
                        key={lang}
                        className={`language-tab ${lang === 'python' ? 'active' : ''}`}
                        onClick={() => {}}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {questionData.supportedLanguages.map(lang => (
                    <div key={lang} className="code-editor-section">
                      <div className="code-header">
                        <h3>{lang.toUpperCase()} Starter Code</h3>
                        <span className="code-description">Template code provided to students</span>
                      </div>
                      <textarea
                        value={questionData.starterCode[lang]}
                        onChange={(e) => setQuestionData(prev => ({
                          ...prev,
                          starterCode: {
                            ...prev.starterCode,
                            [lang]: e.target.value
                          }
                        }))}
                        className="code-textarea"
                        rows="12"
                        placeholder={`Enter ${lang.toUpperCase()} starter code...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Cases Tab */}
            {activeTab === 'test' && (
              <div className="tab-panel">
                <div className="test-cases-section">
                  <div className="section-header">
                    <h3>Test Cases</h3>
                    <button 
                      className="add-test-btn"
                      onClick={addTestCase}
                    >
                      <span className="btn-icon">➕</span>
                      Add Test Case
                    </button>
                  </div>

                  <div className="test-cases-list">
                    {questionData.testCases.map((testCase, index) => (
                      <div key={index} className="test-case-card">
                        <div className="test-case-header">
                          <h4>Test Case {index + 1}</h4>
                          <div className="test-case-controls">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={testCase.isHidden}
                                onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                              />
                              Hidden
                            </label>
                            {questionData.testCases.length > 1 && (
                              <button 
                                className="remove-test-btn"
                                onClick={() => removeTestCase(index)}
                              >
                                <span className="btn-icon">🗑️</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="test-case-content">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Description</label>
                              <input
                                type="text"
                                value={testCase.description}
                                onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                                placeholder="Test case description..."
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label>Points</label>
                              <input
                                type="number"
                                value={testCase.points}
                                onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 1)}
                                min="1"
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Input</label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Enter test input..."
                              className="form-textarea"
                              rows="4"
                            />
                          </div>

                          <div className="form-group">
                            <label>Expected Output</label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                              placeholder="Enter expected output..."
                              className="form-textarea"
                              rows="4"
                            />
                          </div>

                          <button 
                            className="run-test-btn"
                            onClick={() => runTestCase(index)}
                          >
                            <span className="btn-icon">▶️</span>
                            Run Test
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Constraints Tab */}
            {activeTab === 'constraints' && (
              <div className="tab-panel">
                <div className="constraints-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Time Limit (ms)</label>
                      <input
                        type="number"
                        value={questionData.constraints.timeLimit}
                        onChange={(e) => setQuestionData(prev => ({
                          ...prev,
                          constraints: {
                            ...prev.constraints,
                            timeLimit: parseInt(e.target.value) || 2000
                          }
                        }))}
                        min="100"
                        max="10000"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Memory Limit (MB)</label>
                      <input
                        type="number"
                        value={questionData.constraints.memoryLimit}
                        onChange={(e) => setQuestionData(prev => ({
                          ...prev,
                          constraints: {
                            ...prev.constraints,
                            memoryLimit: parseInt(e.target.value) || 256
                          }
                        }))}
                        min="64"
                        max="1024"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Input Format</label>
                    <textarea
                      value={questionData.constraints.inputFormat}
                      onChange={(e) => setQuestionData(prev => ({
                        ...prev,
                        constraints: {
                          ...prev.constraints,
                          inputFormat: e.target.value
                        }
                      }))}
                      placeholder="Describe the input format..."
                      className="form-textarea"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Output Format</label>
                    <textarea
                      value={questionData.constraints.outputFormat}
                      onChange={(e) => setQuestionData(prev => ({
                        ...prev,
                        constraints: {
                          ...prev.constraints,
                          outputFormat: e.target.value
                        }
                      }))}
                      placeholder="Describe the output format..."
                      className="form-textarea"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Create Exam Tab */}
            {activeTab === 'exam' && !isEditing && (
              <div className="tab-panel">
                <div className="exam-section">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={examData.enabled}
                        onChange={(e) => setExamData(prev => ({ ...prev, enabled: e.target.checked }))}
                      />
                      Create exam from this question
                    </label>
                  </div>

                  {examData.enabled && (
                    <div className="exam-form">
                      <div className="form-group">
                        <label>Exam Title *</label>
                        <input
                          type="text"
                          value={examData.title}
                          onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter exam title..."
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Exam Description</label>
                        <textarea
                          value={examData.description}
                          onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter exam description..."
                          className="form-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Course *</label>
                          <input
                            type="text"
                            value={examData.course}
                            onChange={(e) => setExamData(prev => ({ ...prev, course: e.target.value }))}
                            placeholder="e.g., Computer Science"
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label>Course Code *</label>
                          <input
                            type="text"
                            value={examData.courseCode}
                            onChange={(e) => setExamData(prev => ({ ...prev, courseCode: e.target.value }))}
                            placeholder="e.g., CS101"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Duration (minutes) *</label>
                          <input
                            type="number"
                            value={examData.duration}
                            onChange={(e) => setExamData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                            min="15"
                            max="300"
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label>Start Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={examData.startDate}
                            onChange={(e) => setExamData(prev => ({ ...prev, startDate: e.target.value }))}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>End Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={examData.endDate}
                          onChange={(e) => setExamData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>👁️ Question Preview</h3>
              <button 
                className="close-preview-btn"
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>
            </div>
            <div className="preview-content">
              <div className="preview-question">
                <h2>{questionData.title || 'Untitled Question'}</h2>
                <div className="preview-badges">
                  <span className={`difficulty-badge ${questionData.difficulty}`}>
                    {questionData.difficulty?.toUpperCase() || 'MEDIUM'}
                  </span>
                  <span className="category-badge">{questionData.category || 'Programming'}</span>
                </div>
                <div className="preview-description">
                  <p>{questionData.description || 'No description provided'}</p>
                </div>
                <div className="preview-languages">
                  <strong>Supported Languages:</strong>
                  {questionData.supportedLanguages?.map(lang => (
                    <span key={lang} className="language-tag">{lang.toUpperCase()}</span>
                  ))}
                </div>
                <div className="preview-tags">
                  <strong>Tags:</strong>
                  {questionData.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="cancel-btn"
          onClick={() => navigate('/admin/coding-questions')}
        >
          Cancel
        </button>
        
        <div className="save-buttons">
          <button 
            className="save-draft-btn"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            <span className="btn-icon">💾</span>
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button 
            className="publish-btn"
            onClick={() => handleSubmit('published')}
            disabled={loading}
          >
            <span className="btn-icon">🚀</span>
            {loading ? 'Publishing...' : 'Publish Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCodingQuestion;
