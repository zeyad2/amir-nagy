import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { useScrollAnimation, getAnimationClasses } from '@/hooks/useScrollAnimation'
import { HelpCircle } from 'lucide-react'

const faqs = [
  {
    id: 'faq-1',
    question: 'How long are the courses?',
    answer: 'Course duration varies based on the course type. Live courses typically run for 8-12 weeks with scheduled sessions, while self-paced recorded courses can be completed at your own pace. Each course includes comprehensive materials, practice tests, and ongoing support.',
  },
  {
    id: 'faq-2',
    question: 'What is included in each course?',
    answer: 'Each course includes video lessons covering all SAT sections, practice tests with detailed explanations, homework assignments, personalized feedback, and access to Mr. Amir Nagy for questions and guidance. Live courses also include interactive sessions and real-time support.',
  },
  {
    id: 'faq-3',
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Yes! We offer a 7-day money-back guarantee for all our courses. If you\'re not completely satisfied with the course within the first week, contact us for a full refund. We\'re confident in the quality of our teaching and want you to feel comfortable enrolling.',
  },
  {
    id: 'faq-4',
    question: 'Do you provide practice tests?',
    answer: 'Absolutely! All courses include multiple full-length practice tests that simulate the actual SAT exam. Each test comes with detailed answer explanations, performance tracking, and personalized recommendations to help you improve your weak areas.',
  },
  {
    id: 'faq-5',
    question: 'What makes Mr. Amir Nagy\'s teaching method unique?',
    answer: 'Mr. Amir focuses on teaching critical thinking and strategic problem-solving, not just memorization. With over 10 years of experience, he\'s developed proven methods that help students understand the underlying concepts and patterns in SAT questions, leading to consistent score improvements.',
  },
  {
    id: 'faq-6',
    question: 'Can I enroll mid-course in a live session?',
    answer: 'Yes! For live courses, we offer flexible enrollment options. You can join mid-course with access to recorded sessions you missed, or wait for the next cohort to start. Contact us to discuss the best option for your learning goals.',
  },
  {
    id: 'faq-7',
    question: 'What score improvement can I expect?',
    answer: 'While results vary based on individual effort and starting point, our students typically see score improvements of 200-400 points. Many students have achieved 500+ point increases with dedicated practice and by following Mr. Amir\'s proven strategies.',
  },
  {
    id: 'faq-8',
    question: 'Is there support available outside of class hours?',
    answer: 'Yes! Students can ask questions through our learning platform, and Mr. Amir provides regular office hours for one-on-one support. For live courses, you also have access to a student community where you can collaborate and help each other.',
  },
]

export default function FAQSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 ${getAnimationClasses(isVisible, 'fade')}`} ref={ref}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about
            our courses, teaching methods, and enrollment process.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className={`max-w-4xl mx-auto ${getAnimationClasses(isVisible, 'slide-up')}`}>
          <Accordion type="single" collapsible>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="mb-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <AccordionTrigger value={faq.id} className="text-left">
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent value={faq.id}>
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className={`text-center mt-12 ${getAnimationClasses(isVisible, 'fade')}`}>
          <p className="text-lg text-gray-700 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:amir.nagy@example.com"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
